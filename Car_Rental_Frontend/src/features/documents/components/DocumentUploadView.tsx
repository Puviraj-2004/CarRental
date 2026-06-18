'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from 'next/link';

interface UploadBoxProps {
  label: string;
  file: File | null;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
}

const UploadBox: React.FC<UploadBoxProps> = ({
  label,
  file,
  previewUrl,
  onFileChange,
  onRemove,
  inputRef,
  disabled
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <FormLabel sx={{ fontWeight: 700, mb: 1, display: 'block', color: 'text.primary', fontSize: '13px' }}>
        {label}
      </FormLabel>
      <Box
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: file ? 'primary.main' : 'grey.300',
          borderRadius: '12px',
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: file ? 'primary.50' : 'grey.50',
          transition: '0.2s',
          '&:hover': { borderColor: disabled ? 'grey.300' : 'primary.main', bgcolor: disabled ? 'grey.50' : 'primary.50' }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 32, color: file ? 'primary.main' : 'grey.400', mb: 1 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '13px' }}>
          {file ? file.name : 'Click to select file'}
        </Typography>
      </Box>

      {previewUrl && (
        <Box sx={{ mt: 1.5, position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'grey.200' }}>
          <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} />
          <IconButton
            disabled={disabled}
            onClick={onRemove}
            size="small"
            sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

interface DocumentUploadViewProps {
  t: (path: string) => string;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  loading: boolean;
  phase: 'upload' | 'review';
  setPhase: (val: 'upload' | 'review') => void;
  licFront: File | null;
  setLicFront: (f: File | null) => void;
  licBack: File | null;
  setLicBack: (f: File | null) => void;
  idFront: File | null;
  setIdFront: (f: File | null) => void;
  idBack: File | null;
  setIdBack: (f: File | null) => void;
  addrProof: File | null;
  setAddrProof: (f: File | null) => void;
  licenseNumber: string;
  setLicenseNumber: (val: string) => void;
  licenseExpiry: string;
  setLicenseExpiry: (val: string) => void;
  idNumber: string;
  setIdNumber: (val: string) => void;
  idExpiry: string;
  setIdExpiry: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  billIssueDate: string;
  setBillIssueDate: (val: string) => void;
  saveToProfile: boolean; 
  setSaveToProfile: (val: boolean) => void; 
}

export const DocumentUploadView: React.FC<DocumentUploadViewProps> = ({
  t,
  onSubmit,
  error,
  loading,
  phase,
  setPhase,
  licFront,
  setLicFront,
  licBack,
  setLicBack,
  idFront,
  setIdFront,
  idBack,
  setIdBack,
  addrProof,
  setAddrProof,
  licenseNumber,
  setLicenseNumber,
  licenseExpiry,
  setLicenseExpiry,
  idNumber,
  setIdNumber,
  idExpiry,
  setIdExpiry,
  address,
  setAddress,
  birthDate,
  setBirthDate,
  billIssueDate,
  setBillIssueDate,
  saveToProfile,
  setSaveToProfile,
}) => {
  const [licFrontPreview, setLicFrontPreview] = useState<string | null>(null);
  const [licBackPreview, setLicBackPreview] = useState<string | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [addrProofPreview, setAddrProofPreview] = useState<string | null>(null);

  const licFrontRef = useRef<HTMLInputElement>(null);
  const licBackRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const addrProofRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!licFront) return setLicFrontPreview(null);
    const url = URL.createObjectURL(licFront);
    setLicFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [licFront]);

  useEffect(() => {
    if (!licBack) return setLicBackPreview(null);
    const url = URL.createObjectURL(licBack);
    setLicBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [licBack]);

  useEffect(() => {
    if (!idFront) return setIdFrontPreview(null);
    const url = URL.createObjectURL(idFront);
    setIdFrontPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idFront]);

  useEffect(() => {
    if (!idBack) return setIdBackPreview(null);
    const url = URL.createObjectURL(idBack);
    setIdBackPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [idBack]);

  useEffect(() => {
    if (!addrProof) return setAddrProofPreview(null);
    const url = URL.createObjectURL(addrProof);
    setAddrProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [addrProof]);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      
      {/* Stepped Checkout Banner */}
      <Box sx={{ mb: 5, display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'primary.50', p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'primary.100' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Step 1: Reservation (Complete)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>➔</Typography>
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
          Step 2: Document Verification (Active) [1]
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mx: 1 }}>➔</Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          Step 3: Payment (Pending)
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', mb: 1 }}>
          {phase === 'upload' ? 'Identity Verification (KYC)' : 'Verify Extracted Information'}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {phase === 'upload' 
            ? 'Please upload clear photos of your documents to trigger our AI scanner.' 
            : 'Please verify and correct the information below extracted by our AI [1].'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '8px' }}>{error}</Alert>}

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={4}>
          
          {/* ─── LEFT PANEL: DYNAMIC INTERACTION ZONE ───────────────────── */}
          <Grid item xs={12} md={7}>
            
            {phase === 'upload' ? (
              <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  Driver's License (Permis de conduire)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <UploadBox
                      label="License Front"
                      file={licFront}
                      previewUrl={licFrontPreview}
                      onFileChange={(e) => e.target.files?.[0] && setLicFront(e.target.files[0])}
                      onRemove={() => setLicFront(null)}
                      inputRef={licFrontRef}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UploadBox
                      label="License Back"
                      file={licBack}
                      previewUrl={licBackPreview}
                      onFileChange={(e) => e.target.files?.[0] && setLicBack(e.target.files[0])}
                      onRemove={() => setLicBack(null)}
                      inputRef={licBackRef}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  National Identity Card (CNI)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <UploadBox
                      label="ID Card Front"
                      file={idFront}
                      previewUrl={idFrontPreview}
                      onFileChange={(e) => e.target.files?.[0] && setIdFront(e.target.files[0])}
                      onRemove={() => setIdFront(null)}
                      inputRef={idFrontRef}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UploadBox
                      label="ID Card Back"
                      file={idBack}
                      previewUrl={idBackPreview}
                      onFileChange={(e) => e.target.files?.[0] && setIdBack(e.target.files[0])}
                      onRemove={() => setIdBack(null)}
                      inputRef={idBackRef}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  Proof of Address (Justificatif de domicile)
                </Typography>
                <UploadBox
                  label="Current Utility Bill / House Rent Receipt"
                  file={addrProof}
                  previewUrl={addrProofPreview}
                  onFileChange={(e) => e.target.files?.[0] && setAddrProof(e.target.files[0])}
                  onRemove={() => setAddrProof(null)}
                  inputRef={addrProofRef}
                  disabled={loading}
                />
              </Card>
            ) : (
              <Card variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: '16px', bgcolor: 'background.paper' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon sx={{ color: 'secondary.main' }} />
                  Verification Details
                </Typography>

                <Grid container spacing={3}>
                  
                  {/* License Number */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        Driver's License Number
                      </FormLabel>
                      <TextField
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                        disabled={loading}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '8px' } }}
                      />
                    </FormControl>
                  </Grid>

                  {/* License Expiry */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        License Expiry Date
                      </FormLabel>
                      <input
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          outline: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* ID Card Number */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        National ID Card Number
                      </FormLabel>
                      <TextField
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        required
                        disabled={loading}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '8px' } }}
                      />
                    </FormControl>
                  </Grid>

                  {/* ID Card Expiry */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        ID Card Expiry Date
                      </FormLabel>
                      <input
                        type="date"
                        value={idExpiry}
                        onChange={(e) => setIdExpiry(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          outline: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* Driver Birth Date */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        Driver Birth Date
                      </FormLabel>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          outline: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* Proof of Address Date */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        Proof of Address Issue Date
                      </FormLabel>
                      <input
                        type="date"
                        value={billIssueDate}
                        onChange={(e) => setBillIssueDate(e.target.value)}
                        required
                        disabled={loading}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          outline: 'none',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </FormControl>
                  </Grid>

                  {/* Full Verified Address */}
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                        Verified Residential Address
                      </FormLabel>
                      <TextField
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        multiline
                        rows={2}
                        disabled={loading}
                        variant="outlined"
                        InputProps={{ sx: { borderRadius: '8px' } }}
                      />
                    </FormControl>
                  </Grid>

                  {/* Save to Profile Checkbox Block [1] */}
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          disabled={loading}
                          color="primary"
                        />
                      }
                      label="Save these verified documents to my user profile for future rentals [1]"
                    />
                  </Grid>

                </Grid>
              </Card>
            )}
          </Grid>

          {/* ─── RIGHT PANEL: INSTRUCTIONS & CONTROLS ───────────────────── */}
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: '16px', bgcolor: 'background.paper', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ color: 'secondary.main' }} />
                Upload Guidelines
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 500 }}>
                • Images must be clear, unblurry, and fully readable [1].
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 500 }}>
                • Ensure no details or edges of your documents are cut off [1].
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 500 }}>
                • The Utility Bill / Proof of Address must be dated within the last 3 months [1].
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, fontWeight: 500 }}>
                • Maximum file size allowed is 10 MB per file [2].
              </Typography>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              
              {phase === 'upload' ? (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.6, fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '15px' }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Uploading & Scanning...</Typography>
                    </Box>
                  ) : (
                    'Upload & Run AI Scan'
                  )}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.6, fontWeight: 700, textTransform: 'none', borderRadius: '8px', fontSize: '15px' }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Saving details...</Typography>
                    </Box>
                  ) : (
                    'Confirm & Save Documents'
                  )}
                </Button>
              )}

              {phase === 'review' && (
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={loading}
                  onClick={() => setPhase('upload')}
                  sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                >
                  Back to File Upload
                </Button>
              )}

              <Button
                component={Link}
                href="/cars"
                variant="outlined"
                disabled={loading}
                sx={{ py: 1.5, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
              >
                Cancel and Exit
              </Button>
            </Box>
          </Grid>

        </Grid>
      </Box>
    </Container>
  );
};