import React from 'react';
import Box from '@mui/material/Box';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { Footer } from '@/components/layout/Footer/Footer';
import { BottomNav } from '@/components/layout/BottomNav/BottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        pb: { xs: '64px', md: 0 } // Prevents mobile bottom-bar overlapping the footer/content
      }}
    >
      <Navbar />
      
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      <Footer />
      
      {/* Persistent Bottom Bar for Mobile Viewports */}
      <BottomNav />
    </Box>
  );
}