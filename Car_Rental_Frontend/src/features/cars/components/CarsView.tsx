'use client';

import React, { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Link from 'next/link';
import type { Brand, Car, CarFilterInput, FuelType, PageInfo } from '../hooks/useCar';

interface CarsViewProps {
  t: (path: string) => string;
  cars: Car[];
  pageInfo?: PageInfo;
  loading: boolean;
  error: string | null;
  filters: CarFilterInput;
  brands: Brand[];
  fuelTypes: FuelType[];
  startDate: string;
  endDate: string;
  onFilterChange: (name: any, val: any) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

const formatDateInputMin = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getNextDayStr = (dateStr: string): string => {
  if (!dateStr) return formatDateInputMin();
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getBookingDurationDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

const formatMoney = (value: number): string => `${value.toFixed(2)} EUR`;

export const CarsView: React.FC<CarsViewProps> = ({
  t,
  cars,
  pageInfo,
  loading,
  error,
  filters,
  brands,
  fuelTypes,
  startDate,
  endDate,
  onFilterChange,
  onClearFilters,
  onPageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filtersOpen, setFiltersOpen] = useState(false);
  const todayStr = formatDateInputMin();
  const hasDates = Boolean(startDate && endDate);
  const bookingDuration = getBookingDurationDays(startDate, endDate);
  const resultCount = pageInfo?.totalCount ?? cars.length;

  const activeFilterCount = useMemo(() => {
    return [filters.brandId, filters.fuelTypeId, filters.search]
      .filter(Boolean)
      .length;
  }, [filters.brandId, filters.fuelTypeId, filters.search]);

  const filterContent = (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          {t('cars.catalog.filters.title')}
        </Typography>
        <Button size="small" onClick={onClearFilters} sx={{ textTransform: 'none', fontWeight: 700 }}>
          {t('cars.catalog.filters.clear')}
        </Button>
      </Stack>

      <FormControl fullWidth size="small">
        <InputLabel>{t('cars.catalog.filters.brand')}</InputLabel>
        <Select
          label={t('cars.catalog.filters.brand')}
          value={filters.brandId || ''}
          onChange={(event) => onFilterChange('brandId', event.target.value || undefined)}
        >
          <MenuItem value="">{t('cars.catalog.filters.allBrands')}</MenuItem>
          {brands.map((brand) => (
            <MenuItem key={brand.id} value={brand.id}>
              {brand.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel>{t('cars.catalog.filters.fuelType')}</InputLabel>
        <Select
          label={t('cars.catalog.filters.fuelType')}
          value={filters.fuelTypeId || ''}
          onChange={(event) => onFilterChange('fuelTypeId', event.target.value || undefined)}
        >
          <MenuItem value="">{t('cars.catalog.filters.allFuels')}</MenuItem>
          {fuelTypes.map((fuelType) => (
            <MenuItem key={fuelType.id} value={fuelType.id}>
              {fuelType.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isMobile && (
        <Button
          fullWidth
          variant="contained"
          onClick={() => setFiltersOpen(false)}
          sx={{ mt: 1, py: 1.2, fontWeight: 800, borderRadius: '8px' }}
        >
          {t('cars.catalog.filters.button')}
        </Button>
      )}
    </Stack>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100%', pb: { xs: 10, md: 6 } }}>
      {/* Sticky search bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} sx={{ mb: { xs: 1.25, md: 1.5 } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              {t('cars.catalog.title')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {t('cars.catalog.subtitle')}
            </Typography>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: '8px',
              p: { xs: 1.25, md: 1.5 },
              bgcolor: 'background.paper',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('cars.catalog.pickupDate')}
                  value={startDate}
                  inputProps={{ min: todayStr }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => onFilterChange('startDate', event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label={t('cars.catalog.returnDate')}
                  value={endDate}
                  inputProps={{ min: getNextDayStr(startDate) }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(event) => onFilterChange('endDate', event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={9} sm={9} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={t('cars.catalog.search')}
                  placeholder={t('cars.catalog.filters.searchPlaceholder')}
                  value={filters.search || ''}
                  onChange={(event) => onFilterChange('search', event.target.value || undefined)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={3} sm={3} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setFiltersOpen(true)}
                  sx={{
                    minWidth: 0,
                    py: 0.95,
                    borderRadius: '8px',
                    fontWeight: 800,
                    display: { md: 'none' },
                  }}
                >
                  <FilterListRoundedIcon fontSize="small" />
                  {activeFilterCount > 0 && (
                    <Chip
                      label={activeFilterCount}
                      size="small"
                      color="primary"
                      sx={{ ml: 0.5, height: 18, '& .MuiChip-label': { px: 0.6, fontSize: 11, fontWeight: 800 } }}
                    />
                  )}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 } }}>
        {!hasDates && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
            {t('cars.catalog.availabilityHint')}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5} alignItems="flex-start">
          {/* Desktop filter sidebar */}
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: '8px',
                p: 2,
                position: 'sticky',
                top: 140,
                bgcolor: 'background.paper',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)',
              }}
            >
              {filterContent}
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {t('cars.catalog.vehicleCount').replace('{count}', String(resultCount))}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {hasDates ? t('cars.catalog.liveAvailability') : t('cars.catalog.noDatesCta')}
                </Typography>
              </Box>
              {hasDates && (
                <Chip
                  icon={<CalendarMonthRoundedIcon />}
                  label={t('cars.catalog.tripSelected').replace('{days}', String(bookingDuration))}
                  variant="outlined"
                  size="small"
                  sx={{ bgcolor: 'background.paper', fontWeight: 700 }}
                />
              )}
            </Stack>

            {loading ? (
              <Paper variant="outlined" sx={{ borderRadius: '8px', p: 5, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Paper>
            ) : cars.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '8px' }}>
                {t('cars.catalog.emptyState')}
              </Alert>
            ) : (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  {cars.map((car) => {
                    const detailsUrl = hasDates
                      ? `/viewDetails/${car.id}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
                      : `/viewDetails/${car.id}`;
                    const basePrice = Number(car.basePrice);
                    const totalPrice = hasDates ? basePrice * bookingDuration : null;

                    return (
                      <Grid item xs={12} sm={6} md={6} lg={4} key={car.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            transition: 'box-shadow 160ms ease, border-color 160ms ease',
                            '&:hover': {
                              borderColor: 'primary.light',
                              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.10)',
                            },
                          }}
                        >
                          <Box>
                            <CardMedia
                              component="img"
                              src={car.primaryImageUrl || 'https://via.placeholder.com/640x360?text=Vehicle'}
                              alt={`${car.model.brand.name} ${car.model.name}`}
                              sx={{ width: '100%', height: 176, objectFit: 'cover', bgcolor: 'grey.100' }}
                            />
                          </Box>

                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 0.75 }}>
                              {car.model.brand.name} {car.model.name}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1.5 }}>
                              <Chip
                                icon={<LocalGasStationRoundedIcon />}
                                label={car.fuelType?.name || '-'}
                                size="small"
                                variant="outlined"
                              />
                            </Stack>

                            <Divider sx={{ mb: 1.5 }} />

                            <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 1.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block' }}>
                                  {hasDates ? t('cars.catalog.tripTotal') : t('cars.catalog.dailyRate')}
                                </Typography>
                                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 850, lineHeight: 1.2 }}>
                                  {totalPrice != null ? formatMoney(totalPrice) : formatMoney(basePrice)}
                                </Typography>
                                {!hasDates && (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {t('cars.catalog.selectDatesForTotal')}
                                  </Typography>
                                )}
                              </Box>
                            </Stack>

                            <Button
                              fullWidth
                              variant={hasDates ? 'contained' : 'outlined'}
                              component={Link}
                              href={detailsUrl}
                              endIcon={<ArrowForwardRoundedIcon />}
                              sx={{ mt: 'auto', textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                            >
                              {hasDates ? t('cars.catalog.continueBooking') : t('cars.catalog.viewDetails')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {pageInfo && pageInfo.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                    <Pagination
                      count={pageInfo.totalPages}
                      page={pageInfo.currentPage}
                      onChange={(_, page) => onPageChange(page)}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Filters: bottom sheet on mobile, right drawer on larger screens */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: isMobile
            ? { width: '100%', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', p: 2.5, maxHeight: '85vh' }
            : { width: 'min(360px, 92vw)', p: 2.5, borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          {isMobile && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 36,
                height: 4,
                borderRadius: 2,
                bgcolor: 'divider',
              }}
            />
          )}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t('cars.catalog.filters.title')}
          </Typography>
          <IconButton onClick={() => setFiltersOpen(false)} aria-label={t('cars.catalog.filters.close')}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        {filterContent}
      </Drawer>
    </Box>
  );
};
