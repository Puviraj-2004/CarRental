// import { useState } from 'react';
// import { usePathname, useRouter } from 'next/navigation';
// import { useQuery, useApolloClient } from '@apollo/client';
// import { deleteCookie } from 'cookies-next';
// import { signOut } from 'next-auth/react';
// import { 
//   Dashboard, DirectionsCar, People, BookOnline, 
//   BrandingWatermark 
// } from '@mui/icons-material';
// import { GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';
// import { useTranslation } from '@/lib/LanguageContext';

// export const useAdminSidebar = () => {
//   const [open, setOpen] = useState(true);
//   const pathname = usePathname();
//   const router = useRouter();
//   const client = useApolloClient();
//   const { t } = useTranslation();

//   const { data } = useQuery(GET_PLATFORM_SETTINGS_QUERY);
//   const settings = data?.platformSettings;

//   const handleToggle = () => setOpen(!open);

//   const handleLogout = async () => {
//     try {
//       deleteCookie('token');
//       localStorage.clear();
//       await client.clearStore();
//       await signOut({ callbackUrl: '/' });
//     } catch (err) {
//       console.error('Logout failed:', err);
//       router.push('/');
//     }
//   };

//   const menuItems = [
//     { text: t('admin.dashboard'), icon: Dashboard, path: '/admin/dashboard' },
//     { text: t('admin.carsManagement'), icon: DirectionsCar, path: '/admin/cars' },
//     { text: t('admin.bookings'), icon: BookOnline, path: '/admin/bookings' },
//     { text: t('admin.onsiteRentals'), icon: BookOnline, path: '/admin/bookings/onsite' },
//     { text: t('admin.replacementBookings'), icon: BookOnline, path: '/admin/bookings/replacement' },
//     { text: t('admin.inventory'), icon: BrandingWatermark, path: '/admin/inventory' },
//     { text: t('admin.users'), icon: People, path: '/admin/users' },
//   ];

//   return {
//     open,
//     pathname,
//     settings,
//     menuItems,
//     handleToggle,
//     handleLogout,
//     router,
//     t
//   };
// };