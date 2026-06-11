// import { useQuery } from '@apollo/client';
// import { GET_CARS_QUERY } from '@/lib/graphql/queries';

// export const useHome = () => {
//   const { data, loading, error } = useQuery(GET_CARS_QUERY, {
//     variables: {
//       filter: { statuses: ['AVAILABLE'] },
//       pagination: { page: 1, pageSize: 3 },
//     },
//     fetchPolicy: 'cache-and-network'
//   });

//   const featuredCars = data?.cars?.items || [];

//   return {
//     featuredCars,
//     loading,
//     error
//   };
// };