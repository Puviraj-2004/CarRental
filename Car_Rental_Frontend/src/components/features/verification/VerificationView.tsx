'use client';

import React from 'react';
import {
  Box, Button, Typography, Paper, Grid, TextField, 
  Stepper, Step, StepLabel, Card, Stack, Container, Chip,
  FormGroup, FormControlLabel, Checkbox, Snackbar, Alert as MuiAlert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Smartphone as PhoneIcon,
  Laptop as WebIcon,
  Replay as ChangeIcon,
  AutoAwesome as AIScanIcon
} from '@mui/icons-material';

export const VerificationView = ({
  currentStep, setCurrentStep, activeScanning, isSuccess, device, onNext,
  previews, licenseData, setLicenseData, cniData, setCniData,
  addressData, setAddressData, handleFileUpload, handleSubmit,
  isLicenseComplete, isCniComplete, isAddressComplete, alert, setAlert, t
}: any) => {

  const ImageUploadBox = ({ label, preview, onUpload, isScanning, icon }: any) => (
    <Box sx={{ 
      position: 'relative', height: 160, borderRadius: 4, overflow: 'hidden', 
      border: '2px dashed #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', transition: '0.3s',
      '&:hover': { borderColor: '#7C3AED', bgcolor: '#F5F3FF' } 
    }}>
      {preview ? (
        <>
          <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Preview" />
          <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, '&:hover': { opacity: 1 }, transition: '0.2s' }}>
            <Button component="label" variant="contained" size="small" startIcon={<ChangeIcon />} sx={{ bgcolor: 'white', color: 'black' }}>
              {t('kyc.change')} <input type="file" hidden onChange={e => onUpload(e.target.files![0])} />
            </Button>
          </Box>
        </>
      ) : (
        <Button component="label" sx={{ width: '100%', height: '100%', flexDirection: 'column', color: '#64748B', textTransform: 'none' }}>
          {icon}
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>{label}</Typography>
          <input type="file" hidden onChange={e => onUpload(e.target.files![0])} />
        </Button>
      )}
      {isScanning && (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(124, 58, 237, 0.95)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <AIScanIcon sx={{ fontSize: 60 }} />
          </motion.div>
          <Typography variant="h6" fontWeight={900} sx={{ mt: 2 }}>{t('kyc.aiReading')}</Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>{t('kyc.aiWorkTime')}</Typography>
          <Box sx={{ mt: 2, width: '80%', height: 4, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div 
              animate={{ x: ['-100%', '100%'] }} 
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '30%', height: '100%', backgroundColor: 'white', borderRadius: 2 }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  if (isSuccess) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF', textAlign: 'center', p: 3, position: 'fixed', inset: 0, zIndex: 9999 }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircleIcon sx={{ fontSize: 120, color: '#10B981', mb: 4 }} />
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>{t('kyc.documentsSubmitted')}</Typography>
          <Typography variant="h6" color="text.secondary" mb={5}>{t('kyc.docsUnderReview')}</Typography>
          <Paper elevation={0} sx={{ p: 4, bgcolor: '#F0FDF4', borderRadius: 6, border: '2px solid #BBF7D0', maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h5" color="#15803D" fontWeight={800}>{t('kyc.nextStepPayment')}</Typography>
          </Paper>
        </motion.div>
      </Box>
    );
  }

  const LICENSE_CATS = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];

  return (
    <Box sx={{ minHeight: '100vh', py: 6, bgcolor: '#F8FAFC', background: 'linear-gradient(180deg, #F0F9FF 0%, #F8FAFC 100%)' }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, mb: 4, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0' }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>{t('kyc.identityCheck')}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" mt={0.5}>
              {device === 'App' ? <PhoneIcon fontSize="small"/> : <WebIcon fontSize="small"/>}
              <Typography variant="caption" fontWeight={600}>{device === 'App' ? t('kyc.appMode') : t('kyc.webMode')}</Typography>
            </Stack>
          </Box>
          <Stepper activeStep={currentStep} sx={{ width: '50%', display: { xs: 'none', md: 'flex' } }}>
            {[t('kyc.license'), t('kyc.id'), t('kyc.address')].map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
          </Stepper>
        </Paper>

        <AnimatePresence mode="wait">
          
          {/* STEP 1: LICENSE */}
          {currentStep === 0 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>{t('kyc.step1License')}</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox label={t('kyc.uploadFront')} preview={previews.licenseFront} isScanning={activeScanning === 'LICENSE_FRONT'} onUpload={(f: any) => handleFileUpload(f, 'LICENSE', 'FRONT')} icon={<CloudUploadIcon sx={{ fontSize: 40 }} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox label={t('kyc.uploadBack')} preview={previews.licenseBack} isScanning={activeScanning === 'LICENSE_BACK'} onUpload={(f: any) => handleFileUpload(f, 'LICENSE', 'BACK')} icon={<CloudUploadIcon sx={{ fontSize: 40 }} />} />
                  </Grid>
                </Grid>
                <Stack spacing={3} mt={4}>
                  <TextField label={t('kyc.fullName')} fullWidth value={licenseData.name} onChange={e => setLicenseData({...licenseData, name: e.target.value})}/>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.licenseNumber')} fullWidth value={licenseData.number} onChange={e => setLicenseData({...licenseData, number: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.expiryDate')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={licenseData.expiry} onChange={e => setLicenseData({...licenseData, expiry: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.dateOfBirth')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={licenseData.dob} onChange={e => setLicenseData({...licenseData, dob: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.issueDate')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={licenseData.issueDate} onChange={e => setLicenseData({...licenseData, issueDate: e.target.value})}/></Grid>
                  </Grid>
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">{t('kyc.licenseCategories')}</Typography>
                    <FormGroup row sx={{ mt: 1 }}>
                      {LICENSE_CATS.map(cat => (
                        <FormControlLabel key={cat} control={<Checkbox size="small" checked={licenseData.categories.includes(cat)} onChange={(e) => {
                          const checked = e.target.checked;
                          setLicenseData((prev: any) => ({ ...prev, categories: checked ? Array.from(new Set([...prev.categories, cat])) : prev.categories.filter((c: any) => c !== cat) }));
                        }} />} label={<Typography variant="caption">{cat}</Typography>} />
                      ))}
                    </FormGroup>
                  </Box>
                </Stack>
                <Box mt={5} textAlign="right">
                  <Button variant="contained" size="large" onClick={onNext} disabled={!isLicenseComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, bgcolor: '#0F172A' }}>{t('kyc.nextStep')}</Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: ID CARD */}
          {currentStep === 1 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>{t('kyc.step2Id')}</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox label={t('kyc.uploadFront')} preview={previews.cni} isScanning={activeScanning === 'ID_CARD'} onUpload={(f: any) => handleFileUpload(f, 'ID_CARD')} icon={<CloudUploadIcon sx={{ fontSize: 40 }} />} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ImageUploadBox label={t('kyc.uploadBack')} preview={previews.cniBack} isScanning={activeScanning === 'ID_CARD_BACK'} onUpload={(f: any) => handleFileUpload(f, 'ID_CARD', 'BACK')} icon={<CloudUploadIcon sx={{ fontSize: 40 }} />} />
                  </Grid>
                </Grid>
                <Stack spacing={3} mt={4}>
                  <TextField label={t('kyc.idCardName')} fullWidth value={cniData.name} onChange={e => setCniData({...cniData, name: e.target.value})}/>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.idCardNumber')} fullWidth value={cniData.number} onChange={e => setCniData({...cniData, number: e.target.value})}/></Grid>
                    <Grid item xs={12} sm={6}><TextField label={t('kyc.dateOfBirth')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={cniData.dob} onChange={e => setCniData({...cniData, dob: e.target.value})}/></Grid>
                    <Grid item xs={12}><TextField label={t('kyc.idExpiry')} type="date" fullWidth InputLabelProps={{ shrink: true }} value={cniData.idExpiry} onChange={e => setCniData({...cniData, idExpiry: e.target.value})}/></Grid>
                  </Grid>
                </Stack>
                <Box mt={5} display="flex" justifyContent="space-between">
                  <Button onClick={() => setCurrentStep(0)} variant="outlined">{t('kyc.previous')}</Button>
                  <Button variant="contained" size="large" onClick={onNext} disabled={!isCniComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, bgcolor: '#0F172A' }}>{t('kyc.nextStep')}</Button>
                </Box>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: ADDRESS */}
          {currentStep === 2 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card sx={{ p: 5, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                <Typography variant="h6" fontWeight={800} mb={3}>{t('kyc.step3Address')}</Typography>
                <ImageUploadBox label={t('kyc.uploadDocument')} preview={previews.address} isScanning={activeScanning === 'ADDRESS_PROOF'} onUpload={(f: any) => handleFileUpload(f, 'ADDRESS_PROOF')} icon={<CloudUploadIcon sx={{ fontSize: 40 }} />} />
                <TextField label={t('kyc.enterAddress')} multiline rows={3} fullWidth sx={{ mt: 4 }} value={addressData.address} onChange={e => setAddressData({...addressData, address: e.target.value})}/>
                <Box mt={5} display="flex" justifyContent="space-between">
                  <Button onClick={() => setCurrentStep(1)} variant="outlined">{t('kyc.previous')}</Button>
                  <Button variant="contained" color="success" size="large" onClick={handleSubmit} disabled={!isAddressComplete || !!activeScanning} sx={{ px: 6, py: 1.5, borderRadius: 3, fontWeight: 900 }}>
                    {activeScanning ? t('kyc.aiWorking') : t('kyc.submitVerification')}
                  </Button>
                </Box>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 6, opacity: 0.5 }}>
          <Chip icon={<LockIcon />} label={t('kyc.encrypted')} variant="outlined" size="small" />
          <Chip icon={<VerifiedUserIcon />} label={t('kyc.gdprCompliant')} variant="outlined" size="small" />
        </Stack>
      </Container>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setAlert({ ...alert, open: false })} 
          severity={alert.severity} 
          sx={{ width: '100%' }}
        >
          {alert.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};