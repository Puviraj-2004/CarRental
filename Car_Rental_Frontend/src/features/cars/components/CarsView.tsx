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
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import type { Car, PageInfo, CarFilterInput } from '../hooks/useCar';

interface CarsViewProps {
  t: (path: string) => string;
  cars: Car[];
  pageInfo?: PageInfo;
  loading: boolean;
  error: string | null;
  filters: CarFilterInput;
  startDate: string;
  endDate: string;
  onFilterChange: (name: any, val: any) => void;
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
  startDate,
  endDate,
  onFilterChange,
  onClearFilters,
  onPageChange,
}) => {
  const hasDates = !!(startDate && endDate);

  // Timezone-safe local date YYYY-MM-DD generator [1]
  const getLocalTodayStr = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayStr();

  const getNextDayStr = (dateStr: string): string => {
    if (!dateStr) return todayStr;
    try {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    } catch {
      return todayStr;
    }
  };

  const getBookingDurationDays = (): number => {
    if (!hasDates) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const bookingDuration = getBookingDurationDays();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
          {t('cars.catalog.title') || 'Discover Our Premium Fleet'}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
          {t('cars.catalog.subtitle') || 'Select your rental dates and explore luxury mobility.'}
        </Typography>
      </Box>

      {/* ─── Minimalist Search Console ─────────────────────────────────── */}
      <Card 
        variant="outlined" 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 6, 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={3}>
          
          {/* Pick-up Date (Enforced safe local min=today) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                Pick-up Date
              </FormLabel>
              <input
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
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

          {/* Return Date (Enforced safe local min=startDate + 1 day) */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                Return Date
              </FormLabel>
              <input
                type="date"
                min={getNextDayStr(startDate)} 
                value={endDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
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

          {/* Text Search */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <FormLabel sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '13px' }}>
                Search Vehicle / Brand
              </FormLabel>
              <input
                type="text"
                placeholder={t('cars.catalog.filters.searchPlaceholder') || 'e.g., Tesla, Sedan'}
                value={filters.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value || undefined)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
            </FormControl>
          </Grid>

          {/* Pricing Budget */}
          <Grid item xs={12} sm={6} md={3}>
            <FormLabel sx={{ fontWeight: 700, mb: 1, display: 'block', color: 'text.primary', fontSize: '13px' }}>
              Daily Price Budget
            </FormLabel>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                type="number"
                placeholder="Min (€)"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: '50%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
              <input
                type="number"
                placeholder="Max (€)"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: '50%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>
          </Grid>

          {/* Reset Filters */}
          <Grid item xs={12} sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClearFilters}
              sx={{ px: 4, py: 1.2, textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
            >
              Reset Filters
            </Button>
          </Grid>

        </Grid>
      </Card>

      {/* ─── Informative Warning Banner ───────────────────────────────── */}
      {!hasDates && (
        <Alert severity="info" sx={{ mb: 5, borderRadius: '12px', fontWeight: 600 }}>
          Please select your pickup and return dates in the filters above to verify real-time availability and prices [1].
        </Alert>
      )}

      {/* ─── Results Layout ─────────────────────────────────────────────── */}
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: '12px' }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : cars.length === 0 ? (
        <Alert severity="info" sx={{ py: 3, borderRadius: '12px', fontWeight: 600 }}>
          {t('cars.catalog.emptyState') || 'No vehicles found matching these filter criteria.'}
        </Alert>
      ) : (
        <Box>
          {hasDates && (
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary', display: 'block' }}>
              Showing {cars.length} available vehicles for your selected trip duration ({bookingDuration} days) [1].
            </Typography>
          )}

          <Grid container spacing={4}>
            {cars.map((car) => {
              const detailsUrl = hasDates
                ? `/viewDetails/${car.id}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
                : `/viewDetails/${car.id}`;

              const totalPrice = hasDates ? Number(car.basePrice) * bookingDuration : null;

              return (
                <Grid item xs={12} sm={6} md={4} key={car.id}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'transform 0.22s ease, box-shadow 0.22s ease', 
                      '&:hover': { 
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
                      } 
                    }}
                  >
                    <Box sx={{ overflow: 'hidden', position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="220"
                        image={car.primaryImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'}
                        alt={`${car.model.brand.name} ${car.model.name}`}
                        sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.04)' } }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                      
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.5px' }}>
                        {car.model.brand.name} {car.model.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ bgcolor: 'divider', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
                          {car.fuelType?.name || 'Petrol'}
                        </Box>
                        <Box sx={{ bgcolor: 'divider', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: 'text.secondary', fontFamily: 'monospace' }}>
                          {car.plateNumber}
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 'auto', mb: 3 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Daily Rate
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800 }}>
                            {Number(car.basePrice).toFixed(2)} €
                          </Typography>
                        </Box>

                        {totalPrice && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Total Est. Cost ({bookingDuration} days)
                            </Typography>
                            <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 800 }}>
                              {totalPrice.toFixed(2)} €
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        component={Link}
                        href={detailsUrl}
                        sx={{ py: 1.4, fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                      >
                        {hasDates ? 'Book Now' : t('home.fleet.viewDetails')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
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