'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';

interface AdminDocumentsViewProps {
  t: (path: string) => string;
  documents: any;
  onVerify: (userId: string, status: 'APPROVED' | 'REJECTED') => void;
  loading: boolean;
}

export const AdminDocumentsView: React.FC<AdminDocumentsViewProps> = ({
  t,
  documents,
  onVerify,
  loading,
}) => {
  const [activeImage, setActiveImage] = useState<string>(documents.licenseFrontUrl);

  const images = [
    { label: 'License Front', url: documents.licenseFrontUrl },
    { label: 'License Back', url: documents.licenseBackUrl },
    { label: 'ID Card Front', url: documents.idCardFrontUrl },
    { label: 'ID Card Back', url: documents.idCardBackUrl },
    { label: 'Proof of Address', url: documents.addressProofUrl },
  ].filter((item) => !!item.url);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* Back to Queue */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/admin/bookings"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Back to Bookings Queue
        </Button>
      </Box>

      <Grid container spacing={5}>
        
        {/* ─── LEFT PANEL: PHYSICAL SCANS PREVIEW ───────────────────── */}
        <Grid item xs={12} md={6}>
          <Box sx={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', mb: 2, bgcolor: 'grey.100' }}>
            <img src={activeImage} alt="Document Scan" style={{ width: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block' }} />
          </Box>
          <Grid container spacing={1.5}>
            {images.map((img, i) => (
              <Grid item xs={4} sm={2.4} key={i}>
                <Box
                  onClick={() => setActiveImage(img.url)}
                  sx={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: activeImage === img.url ? 'primary.main' : 'transparent',
                    cursor: 'pointer',
                    aspectRatio: '1/1',
                    transition: '0.15s',
                    '&:hover': { opacity: 0.85 }
                  }}
                >
                  <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* ─── RIGHT PANEL: GOOGLE GEMINI AI METADATA AUDIT ─────────── */}
        <Grid item xs={12} md={6}>
          {/* Dynamic Status Badge Header [1] */}
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              AI Verification Audit
            </Typography>
            {documents.status === 'APPROVED' && (
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'success.light', color: 'success.dark', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                APPROVED
              </Box>
            )}
            {documents.status === 'REJECTED' && (
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'error.light', color: 'error.dark', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                REJECTED
              </Box>
            )}
            {documents.status === 'PENDING' && (
              <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'warning.light', color: 'warning.dark', borderRadius: '8px', fontSize: '11px', fontWeight: 800 }}>
                PENDING REVIEW
              </Box>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Verify the physical document photo scans on the left against Google Gemini's AI-extracted fields [1].
          </Typography>

          <Card variant="outlined" sx={{ p: 3, borderRadius: '16px', mb: 4, bgcolor: 'background.paper' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
              Extracted Parameters
            </Typography>
            <Grid container spacing={2} sx={{ fontSize: '13px' }}>
              {[
                { label: "Driver's License Number", val: documents.licenseNumber || 'Not Found' },
                { label: "License Expiry Date", val: documents.licenseExpiry ? new Date(documents.licenseExpiry).toLocaleDateString() : 'Not Found' },
                { label: "Driver Age (calculated)", val: documents.age ? `${documents.age} Years` : 'Not Found' },
                { label: "National ID / Passport Number", val: documents.idNumber || 'Not Found' },
                { label: "ID Card Expiry Date", val: documents.idExpiry ? new Date(documents.idExpiry).toLocaleDateString() : 'Not Found' },
                { label: "Verified Residential Address", val: documents.address || 'Not Found' },
              ].map((field, i) => (
                <React.Fragment key={i}>
                  <Grid item xs={6} sx={{ color: 'text.secondary', fontWeight: 600 }}>{field.label}:</Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 700, color: 'text.primary' }}>{field.val}</Grid>
                  {i < 5 && <Grid item xs={12}><Divider /></Grid>}
                </React.Fragment>
              ))}
            </Grid>
          </Card>

          {/* Verification CTA Controls with Disabled States [1] */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={loading || documents.status === 'APPROVED'}
                onClick={() => onVerify(documents.userId, 'APPROVED')}
                startIcon={!loading && <CheckCircleIcon />}
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Approve Verification'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="error"
                fullWidth
                size="large"
                disabled={loading || documents.status === 'REJECTED'}
                onClick={() => onVerify(documents.userId, 'REJECTED')}
                startIcon={!loading && <CancelIcon />}
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Reject Documents'}
              </Button>
            </Grid>
          </Grid>

        </Grid>
      </Grid>
    </Container>
  );
};