'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentUploadView } from './DocumentUploadView';

export const DocumentUploadContainer: React.FC<{
  bookingId: string;
  adminMode?: boolean;
  returnTo?: string;
}> = ({ bookingId, adminMode = false, returnTo }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const {
    hasApprovedDocumentsData,
    loadingApprovedDocs,
    executeOCR,
    loadingOCR,
    executeSaveBooking,
    loadingSaveBooking,
    executeReuse,
    loadingReuse
  } = useDocuments({ skipApprovedDocuments: adminMode });

  const [error, setError] = useState<string | null>(null);

  // Modal / Selection Dialog States
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  // File States
  const [licFront, setLicFront] = useState<File | null>(null);
  const [licBack, setLicBack] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [addrProof, setAddrProof] = useState<File | null>(null);

  const [phase, setPhase] = useState<'upload' | 'review'>('upload');
  const [uploadedUrls, setUploadedUrls] = useState<any>(null);

  // Form values
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiry, setIdExpiry] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [billIssueDate, setBillIssueDate] = useState('');

  // 1. Initialize checks for Booking ID
  useEffect(() => {
    if (!bookingId) {
      showToast('Missing booking target. Redirecting to fleet...', 'error');
      router.push(adminMode ? '/admin/bookings/onsite' : '/cars');
    }
  }, [bookingId, router, showToast]);

  // 2. Intercept and trigger saved documents prompt as soon as the query finishes loading [1]
  useEffect(() => {
    if (!adminMode && !loadingApprovedDocs && hasApprovedDocumentsData?.hasApprovedDocuments) {
      setShowReuseModal(true);
    }
  }, [adminMode, hasApprovedDocumentsData, loadingApprovedDocs]);

  // Action: Handle Document Reuse [1]
  const handleConfirmReuse = async () => {
    setError(null);
    try {
      await executeReuse(bookingId);
      showToast('Profile documents linked to booking. Redirecting to payment...', 'success');
      router.push(`/booking/${bookingId}/payment`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
      setShowReuseModal(false);
    }
  };

  const handleDeclineReuse = () => {
    setShowReuseModal(false);
  };

  // Action: Handle Files OCR Scan
  const handleExtractDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!licFront || !licBack || !idFront || !idBack || !addrProof) {
      setError('Please upload all 5 required verification documents.');
      return;
    }

    try {
      const res = await executeOCR({
        licenseFront: licFront,
        licenseBack:  licBack,
        idCardFront:  idFront,
        idCardBack:   idBack,
        addressProof: addrProof
      });

      setUploadedUrls(res.urls);

      setLicenseNumber(res.ocr.licenseNumber || '');
      setLicenseExpiry(res.ocr.licenseExpiry || '');
      setIdNumber(res.ocr.idNumber || '');
      setIdExpiry(res.ocr.idExpiry || '');
      setAddress(res.ocr.address || '');
      setBirthDate(res.ocr.birthDate || '');
      setBillIssueDate(new Date().toISOString().split('T')[0]);

      setPhase('review');
      showToast('AI analysis completed. Please verify the details below.', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  // Action: Validate Details & Trigger Update-Profile Prompt Step [1]
  const handleValidateFormAndPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // License expiration check
    if (!licenseExpiry) {
      setError("Please specify your license's expiry date.");
      return;
    }
    const licExpDate = new Date(licenseExpiry);
    if (licExpDate <= today) {
      setError("Your Driver's License has expired. You cannot rent a vehicle.");
      return;
    }

    // ID card expiration check
    if (!idExpiry) {
      setError("Please specify your ID Card's expiry date.");
      return;
    }
    const idExpDate = new Date(idExpiry);
    if (idExpDate <= today) {
      setError("Your National Identity Card has expired.");
      return;
    }

    // Age eligibility check (Minimum age is 18 years old)
    if (!birthDate) {
      setError("Please specify your Birth Date.");
      return;
    }
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    if (calculatedAge < 18) {
      setError("You must be at least 18 years old to rent a vehicle.");
      return;
    }

    // Proof of address freshness check (Utility bill must be issued in last 90 days)
    if (!billIssueDate) {
      setError('Please specify the issue date of your proof of address.');
      return;
    }
    const billDate = new Date(billIssueDate);
    const diffTime = Math.abs(today.getTime() - billDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 90) {
      setError('Your Proof of Address must be dated within the last 3 months.');
      return;
    }

    if (adminMode) {
      void handleFinalSave(false);
      return;
    }

    // Validation passes. Trigger Profile Update modal to obtain explicit user consent [1].
    setShowSaveConfirmModal(true);
  };

  // Action: Execute final Save Booking Documents with chosen Profile choice [1]
  const handleFinalSave = async (userChoseToSaveProfile: boolean) => {
    setShowSaveConfirmModal(false);
    setError(null);

    try {
      await executeSaveBooking(bookingId, {
        ...uploadedUrls,
        licenseNumber,
        licenseExpiry,
        idNumber,
        idExpiry,
        address,
        birthDate
      }, adminMode ? false : userChoseToSaveProfile);

      showToast('Documents saved for this booking.', 'success');
      router.push(adminMode ? (returnTo || `/admin/bookings/${bookingId}`) : `/booking/${bookingId}/payment`); 
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  // 3. Render a clean loader while checking the status to prevent premature form rendering
  if (loadingApprovedDocs) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <CircularProgress size={48} />
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Checking verification status...
        </Typography>
      </Box>
    );
  }

  return (
    <DocumentUploadView
      t={t}
      onSubmit={phase === 'upload' ? handleExtractDetails : handleValidateFormAndPrompt}
      error={error}
      loading={loadingOCR || loadingSaveBooking || loadingReuse}
      phase={phase}
      setPhase={setPhase}
      
      licFront={licFront}
      setLicFront={setLicFront}
      licBack={licBack}
      setLicBack={setLicBack}
      idFront={idFront}
      setIdFront={setIdFront}
      idBack={idBack}
      setIdBack={setIdBack}
      addrProof={addrProof}
      setAddrProof={setAddrProof}
      
      licenseNumber={licenseNumber}
      setLicenseNumber={setLicenseNumber}
      licenseExpiry={licenseExpiry}
      setLicenseExpiry={setLicenseExpiry}
      idNumber={idNumber}
      setIdNumber={setIdNumber}
      idExpiry={idExpiry}
      setIdExpiry={setIdExpiry}
      address={address}
      setAddress={setAddress}
      birthDate={birthDate}
      setBirthDate={setBirthDate}
      billIssueDate={billIssueDate}
      setBillIssueDate={setBillIssueDate}

      // Modals State & Action mappings [1]
      showReuseModal={showReuseModal}
      onConfirmReuse={handleConfirmReuse}
      onDeclineReuse={handleDeclineReuse}
      
      showSaveConfirmModal={showSaveConfirmModal}
      onCloseConfirmModal={() => setShowSaveConfirmModal(false)}
      onConfirmSaveWithProfile={() => handleFinalSave(true)}
      onConfirmSaveBookingOnly={() => handleFinalSave(false)}
      hasExistingProfileDoc={!!hasApprovedDocumentsData?.hasApprovedDocuments}
      adminMode={adminMode}
    />
  );
};
