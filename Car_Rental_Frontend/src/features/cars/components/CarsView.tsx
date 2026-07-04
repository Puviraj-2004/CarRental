'use client';

import React, { useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import Link from 'next/link';
import { getDateRangeDurationDays, getLocalDateInputValue, getNextDateInputValue } from '@/lib/dateUtils';
import { formatMoney } from '@/lib/moneyUtils';
import { replaceToken } from '@/lib/textUtils';
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

type ExtendedCarFilterInput = CarFilterInput & {
  modelId?: string;
};

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
  const isDrawerMode = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filtersOpen, setFiltersOpen] = useState(false);

  const typedFilters = filters as ExtendedCarFilterInput;
  const todayStr = getLocalDateInputValue();
  const bookingDuration = getDateRangeDurationDays(startDate, endDate);
  const hasValidDates = Boolean(startDate && endDate && bookingDuration > 0);
  const hasInvalidDates = Boolean(startDate && endDate && bookingDuration <= 0);
  const resultCount = pageInfo?.totalCount ?? cars.length;

  const modelOptions = useMemo(() => {
    const fromBrands = brands.flatMap((brand: any) => {
      const models = brand.models || brand.carModels || [];
      return models.map((model: any) => ({
        id: String(model.id),
        name: String(model.name),
        brandId: String(brand.id),
      }));
    });

    const fromCars = cars.map((car) => {
      const model: any = car.model;
      const brand: any = car.model.brand;

      return {
        id: String(model.id ?? model.name),
        name: String(model.name),
        brandId: String(brand.id ?? brand.name),
      };
    });

    const map = new Map<string, { id: string; name: string; brandId?: string }>();

    [...fromBrands, ...fromCars].forEach((model) => {
      if (!model.id || !model.name) return;
      if (typedFilters.brandId && model.brandId && model.brandId !== String(typedFilters.brandId)) return;
      map.set(model.id, model);
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [brands, cars, typedFilters.brandId]);

  const activeFilterCount = useMemo(() => {
    return [
      typedFilters.brandId,
      typedFilters.modelId,
      typedFilters.fuelTypeId,
      typedFilters.search,
      startDate,
      endDate,
    ].filter(Boolean).length;
  }, [
    typedFilters.brandId,
    typedFilters.modelId,
    typedFilters.fuelTypeId,
    typedFilters.search,
    startDate,
    endDate,
  ]);

  const filterControlSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'background.paper',
    },
  };

  const filterContent = (
    <Stack spacing={2.25}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 950 }}>
            {t('cars.catalog.filters.title')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activeFilterCount > 0
              ? replaceToken(t('cars.catalog.filters.activeCount'), '{count}', String(activeFilterCount))
              : t('cars.catalog.filters.noActive')}
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={onClearFilters}
          sx={{
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 900,
          }}
        >
          {t('cars.catalog.filters.clear')}
        </Button>
      </Stack>

      <TextField
        fullWidth
        size="small"
        label={t('cars.catalog.filters.search')}
        placeholder={t('cars.catalog.filters.searchPlaceholder')}
        value={typedFilters.search || ''}
        onChange={(event) => onFilterChange('search', event.target.value || undefined)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        sx={filterControlSx}
      />

      <Stack spacing={1.5}>
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
          sx={filterControlSx}
        />

        <TextField
          fullWidth
          size="small"
          type="date"
          label={t('cars.catalog.returnDate')}
          value={endDate}
          inputProps={{ min: getNextDateInputValue(startDate) }}
          InputLabelProps={{ shrink: true }}
          onChange={(event) => onFilterChange('endDate', event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={filterControlSx}
        />
      </Stack>

      <FormControl fullWidth size="small" sx={filterControlSx}>
        <InputLabel>{t('cars.catalog.filters.brand')}</InputLabel>
        <Select
          label={t('cars.catalog.filters.brand')}
          value={typedFilters.brandId || ''}
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

      <FormControl fullWidth size="small" sx={filterControlSx}>
        <InputLabel>{t('cars.catalog.filters.model')}</InputLabel>
        <Select
          label={t('cars.catalog.filters.model')}
          value={typedFilters.modelId || ''}
          onChange={(event) => onFilterChange('modelId', event.target.value || undefined)}
        >
          <MenuItem value="">{t('cars.catalog.filters.allModels')}</MenuItem>
          {modelOptions.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small" sx={filterControlSx}>
        <InputLabel>{t('cars.catalog.filters.fuelType')}</InputLabel>
        <Select
          label={t('cars.catalog.filters.fuelType')}
          value={typedFilters.fuelTypeId || ''}
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

      {isDrawerMode && (
        <Button
          fullWidth
          variant="contained"
          onClick={() => setFiltersOpen(false)}
          sx={{
            mt: 1,
            minHeight: 48,
            borderRadius: 999,
            fontWeight: 950,
            textTransform: 'none',
          }}
        >
          {t('cars.catalog.filters.apply')}
        </Button>
      )}
    </Stack>
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: '100%',
        pb: { xs: 8, md: 7 },
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 2.5, md: 3.5 } }}>
        <Paper
          variant="outlined"
          sx={{
            display: { xs: 'block', md: 'none' },
            mb: 2,
            p: 1.25,
            borderRadius: 3,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            fullWidth
            variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
            onClick={() => setFiltersOpen(true)}
            startIcon={<FilterListRoundedIcon fontSize="small" />}
            sx={{
              minHeight: 46,
              borderRadius: 2,
              fontWeight: 950,
              textTransform: 'none',
              justifyContent: 'center',
            }}
          >
            {t('cars.catalog.filters.button')}
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  ml: 1,
                  height: 22,
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  '& .MuiChip-label': { px: 0.8, fontSize: 11, fontWeight: 950 },
                }}
              />
            )}
          </Button>
        </Paper>

        {!hasValidDates && !hasInvalidDates && (
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: 3 }}>
            {t('cars.catalog.availabilityHint')}
          </Alert>
        )}

        {hasInvalidDates && (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 3 }}>
            {t('cars.catalog.invalidDateHint')}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          {/* DESKTOP FILTER SIDEBAR */}
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                p: 2.5,
                position: 'sticky',
                top: 96,
                bgcolor: 'background.paper',
                boxShadow: (theme) => `0 18px 50px ${alpha(theme.palette.common.black, 0.08)}`,
              }}
            >
              {filterContent}
            </Paper>
          </Grid>

          {/* CATALOG GRID */}
          <Grid item xs={12} md={9}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 950 }}>
                  {replaceToken(t('cars.catalog.vehicleCount'), '{count}', String(resultCount))}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                  {hasValidDates ? t('cars.catalog.liveAvailability') : t('cars.catalog.noDatesCta')}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {hasValidDates && (
                  <Chip
                    icon={<CalendarMonthRoundedIcon />}
                    label={replaceToken(t('cars.catalog.tripSelected'), '{days}', String(bookingDuration))}
                    variant="outlined"
                    sx={{ bgcolor: 'background.paper', fontWeight: 850, borderRadius: 999 }}
                  />
                )}

                {activeFilterCount > 0 && (
                  <Chip
                    icon={<TuneRoundedIcon />}
                    label={replaceToken(t('cars.catalog.filters.activeCount'), '{count}', String(activeFilterCount))}
                    color="primary"
                    variant="outlined"
                    sx={{ bgcolor: 'background.paper', fontWeight: 850, borderRadius: 999 }}
                  />
                )}
              </Stack>
            </Stack>

            {loading ? (
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  p: 6,
                  display: 'flex',
                  justifyContent: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                <CircularProgress />
              </Paper>
            ) : cars.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 4,
                  p: { xs: 3, md: 5 },
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                <DirectionsCarRoundedIcon color="disabled" sx={{ fontSize: 58, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 950, mb: 1 }}>
                  {t('cars.catalog.emptyTitle')}
                </Typography>
                <Typography color="text.secondary">{t('cars.catalog.emptyState')}</Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                <Grid container spacing={2.5}>
                  {cars.map((car) => {
                    const detailsUrl = hasValidDates
                      ? `/viewDetails/${car.id}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
                      : `/viewDetails/${car.id}`;

                    const basePrice = Number(car.basePrice);
                    const totalPrice = hasValidDates ? basePrice * bookingDuration : null;

                    return (
                      <Grid item xs={12} sm={6} lg={4} key={car.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4,
                            overflow: 'hidden',
                            bgcolor: 'background.paper',
                            transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
                            willChange: 'transform',
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.015)',
                              borderColor: 'primary.main',
                              boxShadow: (theme) => `0 24px 70px ${alpha(theme.palette.common.black, 0.14)}`,
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative', height: 196, overflow: 'hidden', bgcolor: 'grey.100' }}>
                            {car.primaryImageUrl ? (
                              <CardMedia
                                component="img"
                                image={car.primaryImageUrl}
                                alt={`${car.model.brand.name} ${car.model.name}`}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 450ms ease',
                                  '.MuiCard-root:hover &': {
                                    transform: 'scale(1.06)',
                                  },
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: '100%',
                                  display: 'grid',
                                  placeItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <Stack spacing={1} alignItems="center">
                                  <DirectionsCarRoundedIcon />
                                  <Typography variant="caption">{t('cars.catalog.imageUnavailable')}</Typography>
                                </Stack>
                              </Box>
                            )}

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                right: 12,
                                justifyContent: 'space-between',
                              }}
                            >
                              <Chip
                                icon={<VerifiedRoundedIcon />}
                                label={t('cars.catalog.verifiedVehicle')}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: 'rgba(255,255,255,0.92)',
                                  backdropFilter: 'blur(12px)',
                                  '& .MuiChip-icon': { color: 'primary.main' },
                                }}
                              />

                              {hasValidDates && (
                                <Chip
                                  label={t('cars.catalog.priceNote')}
                                  size="small"
                                  color="primary"
                                  sx={{ fontWeight: 900 }}
                                />
                              )}
                            </Stack>
                          </Box>

                          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.22, mb: 0.75 }}>
                              {car.model.brand.name} {car.model.name}
                            </Typography>

                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 2 }}>
                              <Chip
                                icon={<LocalGasStationRoundedIcon />}
                                label={car.fuelType?.name || t('cars.catalog.notAvailable')}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 750 }}
                              />
                            </Stack>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={0.4} sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 850 }}>
                                {hasValidDates ? t('cars.catalog.tripTotal') : t('cars.catalog.dailyRate')}
                              </Typography>

                              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 950, lineHeight: 1.15 }}>
                                {totalPrice != null ? formatMoney(totalPrice) : formatMoney(basePrice)}
                              </Typography>

                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                                {hasValidDates
                                  ? t('cars.catalog.selectedDates')
                                  : t('cars.catalog.selectDatesForTotal')}
                              </Typography>
                            </Stack>

                            <Button
                              fullWidth
                              variant={hasValidDates ? 'contained' : 'outlined'}
                              component={Link}
                              href={detailsUrl}
                              endIcon={<ArrowForwardRoundedIcon />}
                              sx={{
                                mt: 'auto',
                                minHeight: 44,
                                textTransform: 'none',
                                fontWeight: 950,
                                borderRadius: 999,
                              }}
                            >
                              {hasValidDates ? t('cars.catalog.continueBooking') : t('cars.catalog.viewDetails')}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {pageInfo && pageInfo.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                    <Pagination
                      count={pageInfo.totalPages}
                      page={pageInfo.currentPage}
                      onChange={(_, page) => onPageChange(page)}
                      color="primary"
                      size={isSmallMobile ? 'small' : 'medium'}
                      shape="rounded"
                    />
                  </Box>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* MOBILE / TABLET FILTER DRAWER */}
      <Drawer
        anchor={isDrawerMode ? 'bottom' : 'right'}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: isDrawerMode
            ? {
                width: '100%',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                p: 2.5,
                maxHeight: '88vh',
                overflowY: 'auto',
              }
            : {
                width: 'min(390px, 92vw)',
                p: 2.5,
                borderTopLeftRadius: 24,
                borderBottomLeftRadius: 24,
                overflowY: 'auto',
              },
        }}
      >
        {isDrawerMode && (
          <Box
            sx={{
              width: 44,
              height: 5,
              borderRadius: 99,
              bgcolor: 'divider',
              mx: 'auto',
              mb: 2,
            }}
          />
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              <TuneRoundedIcon fontSize="small" />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 950, lineHeight: 1.1 }}>
                {t('cars.catalog.filters.title')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('cars.catalog.filters.drawerSubtitle')}
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={() => setFiltersOpen(false)} aria-label={t('cars.catalog.filters.close')}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        {filterContent}
      </Drawer>
    </Box>
  );
};
