import { isAdmin } from '../../utils/authguard';
import { modelService } from '../../services/modelService';
import { 
  GraphQLContext, 
  CreateModelArgs, 
  UpdateModelArgs, 
  DeleteModelArgs 
} from '../../types/graphql';
import { Brand, Car, VehicleModel } from '@prisma/client';


type ModelWithRelations = VehicleModel & {
  brand?: Brand | null;
  cars?: Car[];
};

export const modelResolvers = {
  Query: {
    models: async (_: unknown, { brandId }: { brandId?: string }) => {
      return await modelService.getModels(brandId);
    },
    model: async (_: unknown, { id }: { id: string }) => {
      return await modelService.getModelById(id);
    },
  },

  Mutation: {
    createModel: async (_: unknown, args: CreateModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await modelService.createModel(args);
    },

    updateModel: async (_: unknown, args: UpdateModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await modelService.updateModel(args.id, args);
    },

    deleteModel: async (_: unknown, args: DeleteModelArgs, context: GraphQLContext) => {
      isAdmin(context);
      return await modelService.deleteModel(args.id);
    },
  },

  VehicleModel: {
    brand: async (parent: ModelWithRelations) => {
      return parent.brand || null;
    },
    cars: async (parent: ModelWithRelations) => {
      return parent.cars || [];
    }
  }
};