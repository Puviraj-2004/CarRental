import { useQuery, useApolloClient } from '@apollo/client';
import { useSession, signOut } from 'next-auth/react';
import { deleteCookie } from 'cookies-next';
import { GET_ME_QUERY, GET_PLATFORM_SETTINGS_QUERY } from '@/lib/graphql/queries';
import { useTranslation } from '@/lib/LanguageContext';

export const useNavbar = () => {
  const client = useApolloClient();
  const { data: session } = useSession();
  const { t } = useTranslation();
  
  const { data: userData } = useQuery(GET_ME_QUERY, { 
    skip: !session?.accessToken 
  });
  
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS_QUERY);

  const handleLogout = async () => {
    deleteCookie('token');
    await client.clearStore();
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { label: t('navigation.home'), path: '/' },
    { label: t('navigation.about'), path: '/about' },
    { label: t('navigation.cars'), path: '/cars' },
  ];

  return {
    session,
    userData: userData?.me,
    settings: platformData?.platformSettings || {},
    navItems,
    handleLogout,
    isLoggedIn: !!session,
    t
  };
};