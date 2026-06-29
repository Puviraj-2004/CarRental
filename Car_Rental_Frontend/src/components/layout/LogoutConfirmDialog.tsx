'use client';

import React from 'react';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLanguage } from '@/lib/LanguageContext';

interface LogoutConfirmDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  open,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 36,
              height: 36,
              borderRadius: 1,
              bgcolor: 'error.light',
              color: 'error.dark',
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </Box>
          <Typography variant="h6" component="span">
            {t('navbar.logoutTitle')}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t('navbar.logoutDescription')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {t('navbar.logoutCancel')}
        </Button>
        <Button onClick={onConfirm} disabled={loading} color="error" variant="contained">
          {t('navbar.logoutAction')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
