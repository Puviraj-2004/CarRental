import { isAdmin } from '../../utils/authguard';
import { brandService } from '../../services/brandService';
import { 
  GraphQLContext, 
  CreateBrandArgs, 
  UpdateBrandArgs, 
  DeleteBrandArgs 
} from '../../types/graphql';


export const brandResolvers = {
  Query: {
    brands: async () => {
      return await brandService.getBrands();
    },
  },

  Mutation: {
    createBrand: async (_: unknown, args: CreateBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await brandService.createBrand(args);
    },

    updateBrand: async (_: unknown, args: UpdateBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await brandService.updateBrand(args.id, args);
    },

    deleteBrand: async (_: unknown, args: DeleteBrandArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await brandService.deleteBrand(args.id);
    },
  },

  // Field resolver to prevent N+1 issues or handle complex relations
  Brand: {
    // models: async (parent: any, _: unknown, context: GraphQLContext) => {
    //   if (parent.models) return parent.models;
    //   if (context.loaders) {
    //     return context.loaders.modelByBrandLoader.load(parent.id);
    //   }
    //   return [];
    // },
    cars: async (parent: any, _: unknown, _context: GraphQLContext) => {
      if (parent.cars) return parent.cars;
      // You can add a carLoader here later if needed
      return [];
    }
  }
};