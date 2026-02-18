'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Badge,
  CreditCard,
  Home,
  Warning,
  Error as ErrorIcon,
  ZoomIn,
  Close,
  Verified,
  DocumentScanner,
} from '@mui/icons-material';
import { formatDateForDisplay } from '@/lib/dateUtils';

// ============================================================================
// TYPES
// ============================================================================
interface AdminDocumentsViewProps {
  booking: any;
  actions: {
    approve: () => Promise<boolean>;
    reject: (reason: string) => Promise<boolean>;
    upload: (files: {
      licenseFrontFile?: File | null;
      licenseBackFile?: File | null;
      idCardFile?: File | null;
      idCardBackFile?: File | null;
      addressProofFile?: File | null;
    }) => Promise<boolean>;
    refresh: () => void;
  };
  onBack: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

// ============================================================================
// STATUS CONFIGURATIONS
// ============================================================================
const DOC_STATUS_CONFIG: Record<string, { color: 'success' | 'warning' | 'error'; icon: React.ReactElement; labelKey: string; bgcolor: string }> = {
  APPROVED: { color: 'success', icon: <CheckCircle />, labelKey: 'admin.approved', bgcolor: 'success.50' },
  PENDING: { color: 'warning', icon: <Schedule />, labelKey: 'admin.pendingReview', bgcolor: 'warning.50' },
  REJECTED: { color: 'error', icon: <ErrorIcon />, labelKey: 'admin.rejected', bgcolor: 'error.50' },
  NOT_UPLOADED: { color: 'warning', icon: <Warning />, labelKey: 'admin.notUploaded', bgcolor: 'grey.100' },
};

// ============================================================================
// DOCUMENT IMAGE CARD COMPONENT
// ============================================================================
interface DocumentCardProps {
  title: string;
  icon: React.ReactNode;
  imageUrl: string | null;
  onView: () => void;
  notUploadedText: string;
}

const DocumentCard = ({ title, icon, imageUrl, onView, notUploadedText }: DocumentCardProps) => (
  <Card
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: imageUrl ? 'divider' : 'grey.300',
      borderRadius: 2,
      overflow: 'hidden',
      height: '100%',
      bgcolor: imageUrl ? 'background.paper' : 'grey.50',
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ color: imageUrl ? 'primary.main' : 'grey.400', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle2" fontWeight={700} color={imageUrl ? 'text.primary' : 'text.secondary'}>
        {title}
      </Typography>
    </Box>
    {imageUrl ? (
      <CardMedia
        sx={{
          position: 'relative',
          height: 200,
          cursor: 'pointer',
          '&:hover .zoom-overlay': { opacity: 1 },
        }}
        onClick={onView}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 300px"
        />
        <Box
          className="zoom-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <ZoomIn sx={{ color: 'white', fontSize: 40 }} />
        </Box>
      </CardMedia>
    ) : (
      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="body2" color="text.disabled">
          {notUploadedText}
        </Typography>
      </Box>
    )}
  </Card>
);

// ============================================================================
// DATA ROW COMPONENT
// ============================================================================
const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography component="div" variant="body2" fontWeight={600} color={valueColor || 'text.primary'} sx={{ textAlign: 'right' }}>
      {value || '—'}
    </Typography>
  </Box>
);

// ============================================================================
// INFO CARD COMPONENT
// ============================================================================
const InfoCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 3,
        py: 2,
        bgcolor: 'grey.50',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Box>
    <Box sx={{ p: 3 }}>{children}</Box>
  </Paper>
);

// ============================================================================
// IMAGE VIEWER MODAL
// ============================================================================
interface ImageViewerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

const ImageViewer = ({ open, onClose, imageUrl, title }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" onClick={handleZoomOut} disabled={scale <= 0.5}>
            −
          </Button>
          <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Button size="small" onClick={handleZoomIn} disabled={scale >= 3}>
            +
          </Button>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100', p: 2 }}>
        <Box
          sx={{
            transform: `scale(${scale})`,
            transition: 'transform 0.2s',
            transformOrigin: 'center',
          }}
        >
          <Image src={imageUrl} alt={title} width={800} height={600} style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AdminDocumentsView = ({ booking, actions, onBack, t }: AdminDocumentsViewProps) => {
  // State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{
    licenseFrontFile: File | null;
    licenseBackFile: File | null;
    idCardFile: File | null;
    idCardBackFile: File | null;
    addressProofFile: File | null;
  }>({
    licenseFrontFile: null,
    licenseBackFile: null,
    idCardFile: null,
    idCardBackFile: null,
    addressProofFile: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [imageViewer, setImageViewer] = useState<{ open: boolean; url: string; title: string }>({
    open: false,
    url: '',
    title: '',
  });

  // Derived data
  const bookingRef = booking.id?.slice(-6).toUpperCase() || 'N/A';
  const doc = booking.documentVerification;
  const docStatus = doc?.status || 'NOT_UPLOADED';
  const statusConfig = DOC_STATUS_CONFIG[docStatus] || DOC_STATUS_CONFIG.NOT_UPLOADED;
  const customerName = booking.guestName || booking.user?.fullName || 'Guest Customer';

  // Only allow verification when booking is CONFIRMED and document status is PENDING
  const isVerificationStage = ['PENDING', 'VERIFIED', 'CONFIRMED'].includes(booking.status);
  const canApprove = docStatus === 'PENDING' && isVerificationStage;
  const canReject = docStatus === 'PENDING' && isVerificationStage;

  // Format dates
  const formatDocDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '—';
      return formatDateForDisplay(dateStr);
    } catch {
      return '—';
    }
  };

  // Document list
  const documents = [
    { title: t('admin.licenseFront'), icon: <Badge />, url: doc?.licenseFrontUrl },
    { title: t('admin.licenseBack'), icon: <Badge />, url: doc?.licenseBackUrl },
    { title: t('admin.idCardFront'), icon: <CreditCard />, url: doc?.idCardUrl },
    { title: t('admin.idCardBack'), icon: <CreditCard />, url: doc?.idCardBackUrl },
    { title: t('admin.addressProof'), icon: <Home />, url: doc?.addressProofUrl },
  ];

  const uploadedCount = documents.filter((d) => d.url).length;

  // Handlers
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await actions.approve();
      setSnackbar({ open: true, message: t('admin.documentsApprovedSuccess'), severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: t('admin.failedToApprove'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await actions.reject(rejectReason);
      setSnackbar({ open: true, message: t('admin.documentsRejected'), severity: 'success' });
      setRejectDialogOpen(false);
      setRejectReason('');
    } catch (error: any) {
      setSnackbar({ open: true, message: t('admin.failedToReject'), severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openImageViewer = (url: string, title: string) => {
    setImageViewer({ open: true, url, title });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      await actions.upload(uploadFiles);
      setSnackbar({ open: true, message: t('admin.documentsUploadedSuccess'), severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: t('admin.failedToUploadDocuments'), severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 3 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                onClick={onBack}
                sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                {t('admin.back')}
              </Button>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.700' }} />
              <Stack>
                <Typography variant="h5" fontWeight={700}>
                  {t('admin.documentVerification')}
                </Typography>
                <Typography variant="body2" color="grey.400">
                  {t('admin.booking')} #{bookingRef} • {customerName}
                </Typography>
              </Stack>
            </Stack>
            <Chip
              icon={statusConfig.icon}
              label={t(statusConfig.labelKey)}
              color={statusConfig.color}
              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
            />
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Status Alert */}
          {docStatus === 'REJECTED' && doc?.rejectionReason && (
            <Alert severity="error" icon={<ErrorIcon />}>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('admin.rejectionReason')}
              </Typography>
              <Typography variant="body2">{doc.rejectionReason}</Typography>
            </Alert>
          )}

          {docStatus === 'APPROVED' && (
            <Alert severity="success" icon={<Verified />}>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('admin.documentsVerified')}
              </Typography>
              <Typography variant="body2">{t('admin.verifiedOn')} {formatDocDate(doc?.verifiedAt)}</Typography>
            </Alert>
          )}

          {docStatus === 'NOT_UPLOADED' && (
            <Alert severity="warning" icon={<Warning />}>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('admin.noDocumentsUploaded')}
              </Typography>
              <Typography variant="body2">{t('admin.customerNotUploadedYet')}</Typography>
            </Alert>
          )}

          <InfoCard title={t('admin.uploadDocuments')} icon={<DocumentScanner />}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">{t('admin.licenseFront')}</Typography>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFiles((s) => ({ ...s, licenseFrontFile: e.target.files?.[0] || null }))} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">{t('admin.licenseBack')}</Typography>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFiles((s) => ({ ...s, licenseBackFile: e.target.files?.[0] || null }))} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">{t('admin.idCardFront')}</Typography>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFiles((s) => ({ ...s, idCardFile: e.target.files?.[0] || null }))} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">{t('admin.idCardBack')}</Typography>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFiles((s) => ({ ...s, idCardBackFile: e.target.files?.[0] || null }))} />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">{t('admin.addressProof')}</Typography>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setUploadFiles((s) => ({ ...s, addressProofFile: e.target.files?.[0] || null }))} />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
                <Button variant="outlined" onClick={() => setUploadFiles({ licenseFrontFile: null, licenseBackFile: null, idCardFile: null, idCardBackFile: null, addressProofFile: null })} disabled={uploading || isSubmitting}>
                  {t('admin.clear')}
                </Button>
                <Button variant="contained" onClick={handleUpload} disabled={uploading || isSubmitting}>
                  {uploading ? t('admin.uploading') : t('admin.uploadDocuments')}
                </Button>
              </Stack>
            </Stack>
          </InfoCard>

          {/* Show message when booking is not CONFIRMED but has pending documents */}
          {docStatus === 'PENDING' && !isVerificationStage && (
            <Alert severity="info" icon={<Schedule />}>
              <Typography variant="subtitle2" fontWeight={700}>
                {t('admin.verificationNotAvailable')}
              </Typography>
              <Typography variant="body2">
                {t('admin.verificationNotAvailableDesc')} {booking.status}
              </Typography>
            </Alert>
          )}

          {/* Action Bar - Desktop */}
          {canApprove && (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: { xs: 'none', md: 'block' } }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {uploadedCount} {t('admin.of')} {documents.length} {t('admin.documentsUploaded')}
                </Typography>
                <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={() => setRejectDialogOpen(true)} disabled={isSubmitting}>
                  {t('admin.rejectDocuments')}
                </Button>
                <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={handleApprove} disabled={isSubmitting} sx={{ minWidth: 140 }}>
                  {isSubmitting ? t('admin.approving') : t('admin.approveDocuments')}
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Document Images Grid */}
          <InfoCard title={t('admin.uploadedDocuments')} icon={<DocumentScanner />}>
            <Grid container spacing={2}>
              {documents.map((docItem) => (
                <Grid item xs={12} sm={6} md={4} key={docItem.title}>
                  <DocumentCard
                    title={docItem.title}
                    icon={docItem.icon}
                    imageUrl={docItem.url}
                    onView={() => docItem.url && openImageViewer(docItem.url, docItem.title)}
                    notUploadedText={t('admin.notUploaded')}
                  />
                </Grid>
              ))}
            </Grid>
          </InfoCard>

          {/* Extracted Data */}
          {doc && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* License Information */}
              <InfoCard title={t('admin.driversLicense')} icon={<Badge />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label={t('admin.licenseNumber')} value={doc.licenseNumber} />
                  <DataRow label={t('admin.issueDate')} value={formatDocDate(doc.licenseIssueDate)} />
                  <DataRow label={t('admin.expiryDate')} value={formatDocDate(doc.licenseExpiry)} />
                  <DataRow label={t('admin.dateOfBirth')} value={formatDocDate(doc.driverDob)} />
                  <DataRow
                    label={t('admin.categories')}
                    value={
                      doc.licenseCategories?.length > 0 ? (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                          {doc.licenseCategories.map((cat: string) => (
                            <Chip key={cat} label={cat} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          ))}
                        </Stack>
                      ) : (
                        '—'
                      )
                    }
                  />
                </Stack>
              </InfoCard>

              {/* ID Card Information */}
              <InfoCard title={t('admin.idCardDetails')} icon={<CreditCard />}>
                <Stack spacing={0} divider={<Divider />}>
                  <DataRow label={t('admin.idNumber')} value={doc.idNumber} />
                  <DataRow label={t('admin.expiryDate')} value={formatDocDate(doc.idExpiry)} />
                  <DataRow label={t('admin.verifiedAddress')} value={doc.verifiedAddress} />
                </Stack>
              </InfoCard>
            </Box>
          )}

          {/* AI Metadata (if available) */}
          {doc?.aiMetadata && (
            <InfoCard title={t('admin.ocrAnalysis')} icon={<DocumentScanner />}>
              <Typography variant="body2" color="text.secondary" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {typeof doc.aiMetadata === 'string' ? doc.aiMetadata : JSON.stringify(doc.aiMetadata, null, 2)}
              </Typography>
            </InfoCard>
          )}

          {/* Mobile Action Buttons */}
          {canApprove && (
            <Paper
              elevation={3}
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                display: { xs: 'block', md: 'none' },
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                zIndex: 1000,
              }}
            >
              <Stack spacing={1.5}>
                <Button variant="contained" color="success" fullWidth size="large" startIcon={<CheckCircle />} onClick={handleApprove} disabled={isSubmitting}>
                  {isSubmitting ? t('admin.approving') : t('admin.approveDocuments')}
                </Button>
                <Button variant="outlined" color="error" fullWidth startIcon={<Cancel />} onClick={() => setRejectDialogOpen(true)} disabled={isSubmitting}>
                  {t('admin.rejectDocuments')}
                </Button>
              </Stack>
            </Paper>
          )}

          {/* Spacer for mobile fixed buttons */}
          <Box sx={{ height: { xs: canApprove ? 140 : 0, md: 0 } }} />
        </Stack>
      </Container>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('admin.rejectDocuments')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t('admin.rejectDocumentsWarning')}
          </Alert>
          <TextField
            autoFocus
            label={t('admin.rejectionReason')}
            placeholder={t('admin.rejectionReasonPlaceholder')}
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={isSubmitting}>
            {t('admin.cancel')}
          </Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectReason.trim() || isSubmitting}>
            {isSubmitting ? t('admin.rejecting') : t('admin.confirmRejection')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Modal */}
      {imageViewer.open && (
        <ImageViewer
          open={imageViewer.open}
          onClose={() => setImageViewer({ open: false, url: '', title: '' })}
          imageUrl={imageViewer.url}
          title={imageViewer.title}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDocumentsView;
