import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    'src/graphql/base.graphql',
    'src/modules/**/*.graphql',   // picks up every module's SDL automatically
  ],
  generates: {
    'src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../context#GraphQLContext',
        scalars: {
          DateTime: 'Date',
          Upload:   'Promise<import("graphql-upload-ts").FileUpload>',
        },
        enumsAsTypes: true,
        avoidOptionals: false,
        /**
         * Mappers: tell codegen that when a resolver returns a GraphQL type,
         * the actual runtime value is the corresponding Prisma object.
         * This resolves Date vs String mismatches for createdAt/updatedAt
         * and lets resolver signatures accept Prisma payloads directly.
         */
        mappers: {
          User:         '../../prisma/types#UserWithRelations',
          Documents:    '../../prisma/types#PrismaDocuments',
          Booking:      '../../prisma/types#BookingWithRelations',
          Car:          '../../prisma/types#CarWithRelations',
          VehicleModel: '../../prisma/types#ModelWithBrand',
        },
      },
    },
  },
};

export default config;