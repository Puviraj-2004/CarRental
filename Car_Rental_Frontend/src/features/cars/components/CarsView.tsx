'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import Link from 'next/link';
import type { Car, PageInfo, CarFilterInput } from '../hooks/useCar';

interface CarsViewProps {
  t: (path: string) => string;
  cars: Car[];
  pageInfo?: PageInfo;
  loading: boolean;
  error: string | null;
  filters: CarFilterInput;
  onFilterChange: (name: keyof CarFilterInput, val: string | number | undefined) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export const CarsView: React.FC<CarsViewProps> = ({
  t,
  cars,
  pageInfo,
  loading,
  error,
  filters,
  onFilterChange,
  onClearFilters,
  onPageChange,
}) => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          {t('cars.catalog.title')}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          {t('cars.catalog.subtitle')}
        </Typography>
      </Box>

      {/* ─── Filter Bar (Fully Responsive) ──────────────────────────────── */}
      <Card sx={{ p: 3, mb: 5, borderRadius: '12px', border: 1, borderColor: 'grey.100', boxShadow: 'none' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <input
              type="text"
              placeholder={t('cars.catalog.filters.searchPlaceholder')}
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={2}>
            <input
              type="number"
              placeholder={t('cars.catalog.filters.minPrice')}
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <input
              type="number"
              placeholder={t('cars.catalog.filters.maxPrice')}
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value || undefined)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
                backgroundColor: '#fff',
                boxSizing: 'border-box'
              }}
            >
              <option value="">{t('cars.catalog.filters.allStatuses')}</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClearFilters}
              sx={{ py: 1.3, textTransform: 'none', fontWeight: 600 }}
            >
              {t('cars.catalog.filters.clear')}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* ─── Results Handling ───────────────────────────────────────────── */}
      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : cars.length === 0 ? (
        <Alert severity="info" sx={{ py: 3, borderRadius: '12px' }}>
          {t('cars.catalog.emptyState')}
        </Alert>
      ) : (
        <Box>
          <Grid container spacing={4}>
            {cars.map((car) => (
              <Grid item xs={12} sm={6} md={4} key={car.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: 1, borderColor: 'grey.100' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={car.primaryImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={`${car.model.brand.name} ${car.model.name}`}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {car.model.brand.name} {car.model.name}
                    </Typography>
                    
                    <Typography sx={{ color: 'text.secondary', fontSize: '14px', mb: 2, display: 'flex', gap: '8px' }}>
                      <span>• {car.fuelType?.name || 'Essence'}</span>
                      <span>• {car.plateNumber}</span>
                    </Typography>

                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, mt: 'auto', mb: 3 }}>
                      {car.basePrice.toFixed(2)} {t('cars.catalog.pricePerDay')}
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      component={Link}
                      href={`/viewDetails/${car.id}`}
                      sx={{ py: 1.2, fontWeight: 700, textTransform: 'none' }}
                    >
                      {t('home.fleet.viewDetails')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* ─── Pagination Control ─────────────────────────────────────── */}
          {pageInfo && pageInfo.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
              <Pagination
                count={pageInfo.totalPages}
                page={pageInfo.currentPage}
                onChange={(_, page) => onPageChange(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};