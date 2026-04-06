import { ApiError } from '@/types/ApiError';
import { z } from 'zod';

export const validateResponse = <T>(
    schema: z.ZodSchema<T>,
    data: any
): T => {

    const result = schema.safeParse(data);

    if (!result.success) {
        const error: ApiError = {
            status: 500,
            message: 'Invalid server response',
            data: result.error,
        };

        throw error;
    }

    return result.data;

}