'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/lib/ToastContext';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentUploadView } from './DocumentUploadView';
import { validateFileMime, validateFileExtension, validateFileSize } from '@/lib/fileValidation';

export const DocumentUploadContainer: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  const { executeOCR, loadingOCR, executeSaveBooking, loadingSaveBooking } = useDocuments();
  const [error, setError] = useState<string | null>(null);

  // File States
  const [licFront, setLicFront] = useState<File | null>(null);
  const [licBack, setLicBack] = useState<File | null>(null);
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [addrProof, setAddrProof] = useState<File | null>(null);

  const [phase, setPhase] = useState<'upload' | 'review'>('upload');
  const [uploadedUrls, setUploadedUrls] = useState<any>(null);

  // Controlled Checkbox state (Defaults to true to encourage verified profile generation) [1]
  const [saveToProfile, setSaveToProfile] = useState(true); 

  // Form values
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiry, setIdExpiry] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [billIssueDate, setBillIssueDate] = useState('');

  useEffect(() => {
    if (!bookingId) {
      showToast('Missing booking target. Redirecting to fleet...', 'error');
      router.push('/cars');
    }
  }, [bookingId, router, showToast]);

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

  const handleSaveAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!licenseExpiry) {
      setError("Please specify your license's expiry date.");
      return;
    }
    const licExpDate = new Date(licenseExpiry);
    if (licExpDate <= today) {
      setError("Your Driver's License has expired. You cannot rent a vehicle.");
      return;
    }

    if (!idExpiry) {
      setError("Please specify your ID Card's expiry date.");
      return;
    }
    const idExpDate = new Date(idExpiry);
    if (idExpDate <= today) {
      setError("Your National Identity Card has expired.");
      return;
    }

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

    try {
      // Submits files, checked metadata, and saveToProfile boolean [1]
      await executeSaveBooking(bookingId, {
        ...uploadedUrls,
        licenseNumber,
        licenseExpiry,
        idNumber,
        idExpiry,
        address,
        birthDate
      }, saveToProfile); // <-- Passed checkbox state [1]

      showToast('Documents verified and saved. Redirecting to payment...', 'success');
      router.push(`/booking/${bookingId}/payment`); 
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    }
  };

  return (
    <DocumentUploadView
      t={t}
      onSubmit={phase === 'upload' ? handleExtractDetails : handleSaveAndConfirm}
      error={error}
      loading={loadingOCR || loadingSaveBooking}
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
      saveToProfile={saveToProfile}         // <-- Passed checkbox value [1]
      setSaveToProfile={setSaveToProfile}   // <-- Passed checkbox setter
    />
  );
};