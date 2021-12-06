import "reflect-metadata";
import mongoose, { Mongoose, Model } from "mongoose";
import { Service } from "typedi";

import config from "../../config";
import { logger } from "../../utils/logger";
import { DbResponseModel } from "../models";

@Service()
export class DatabaseService {
    public async initializeAndConnectDB(): Promise<Mongoose> {
        const password = encodeURIComponent(config.database.password);
        const DB_URL = `mongodb://${config.database.username}:${password}@${config.database.host}:${config.database.port}/${config.database.name}?authSource=admin`;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // eslint-disable-next-line @typescript-eslint/camelcase
            auto_reconnect: true,
            autoIndex: false, // Don't build indexes
            poolSize: config.database.poolSize, // Maintain up to 10 socket connections
        };
        console.log('====================> Connecting here ============++> ', DB_URL)
        return mongoose.connect(DB_URL, options);
    }

    public async addItem(model: any, payload: unknown): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.addItem: Adding new item in: " +
                model.collection.collectionName,
                payload
            );
            const savedItem = await new model(payload).save();
            if (savedItem) {
                const result: DbResponseModel = { payload: savedItem, success: true }
                logger.info(
                    "DATABASE_SERVICE.addItem: Recieved saved item from: " +
                    model.collection.collectionName,
                    savedItem
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.addItem: Error occured while adding item in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async getSingleItem(
        model: Model<unknown>,
        query: unknown,
        projectPayload?: unknown,
        options?: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getSingleItem: getting single item from: " +
                model.collection.collectionName,
                query
            );

            const result: DbResponseModel = projectPayload
                ? await model.findOne(query, projectPayload, options).lean()
                : await model.findOne(query, null, options).lean();

            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getSingleItem: Recieved query result from: " +
                    model.collection.collectionName,
                    result
                );

                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getSingleItem: Error occured while getting single item in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async getLimitedItems(
        model: Model<unknown>,
        query: unknown,
        limit: number
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getLimitedItems: getting limited items from: " +
                model.collection.collectionName +
                " Limit: " +
                limit,
                query
            );
            const result = await model.find(query).limit(limit).lean();
            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getLimitedItems: Recieved query result from: " +
                    model.collection.collectionName +
                    " Limit: " +
                    limit,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getLimitedItems: Error occured while getting many items in in: " +
                model.collection.collectionName +
                " Limit: " +
                limit,
            )
            return {
                success: false,
                error: error,
            };
        }
    }

    public async getLimitedItemsWithCustomResult(
        model: Model<unknown>,
        query: unknown,
        limit: number,
        projectPayload: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getLimitedItemsWithCustomResult: getting limited items from: " +
                model.collection.collectionName +
                " Limit: " +
                limit,
                query
            );
            const result = await model
                .find(query, projectPayload)
                .limit(limit)
                .lean();
            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getLimitedItemsWithCustomResult: Recieved query result from: " +
                    model.collection.collectionName +
                    " Limit: " +
                    limit,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getLimitedItemsWithCustomResult: Error occured while getting many items in in: " +
                model.collection.collectionName +
                " Limit: " +
                limit,
                error
            );
            return {
                success: false,
                error: error,
            };
        }
    }

    public async getAggregatedGroupedItems(
        model: Model<unknown>,
        query: unknown,
        groupingPayload: unknown,
        projectPayload?: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getAggregatedGroupedItems: getting aggregated items from: " +
                model.collection.collectionName,
                query
            );

            const result = projectPayload
                ? model
                    .aggregate([
                        { $match: query },
                        { $group: groupingPayload },
                        { $project: projectPayload },
                    ])
                    .allowDiskUse(true)
                : model.aggregate([{ $match: query }, { $group: groupingPayload }]);

            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getAggregatedGroupedItems: Recieved query result from: " +
                    model.collection.collectionName,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getAggregatedGroupedItems: Error occured while getting aggregated items in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async getAggregatedJoinedItems(
        model: Model<unknown>,
        from: unknown,
        localField: unknown,
        foreignField: unknown,
        as: unknown,
        modelQuery: unknown,
        fromQuery: unknown,
        projectPayload: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getAggregatedJoinedItems: getting aggregated items from: " +
                model.collection.collectionName,
                modelQuery,
                from,
                fromQuery
            );

            const result = model
                .aggregate([
                    { $match: modelQuery },
                    {
                        $lookup: {
                            from,
                            localField,
                            foreignField,
                            as,
                        },
                    },
                    { $match: fromQuery },
                    { $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: true } },
                    { $project: projectPayload },
                ])
                .allowDiskUse(true);

            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getAggregatedJoinedItems: Recieved query result from: " +
                    model.collection.collectionName,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getAggregatedGroupedItems: Error occured while getting aggregated items in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async getManyItems(
        model: Model<unknown>,
        query: unknown,
        projectPayload?: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getManyItems: getting many items from: " +
                model.collection.collectionName,
                query
            );
            const result = projectPayload
                ? await model.find(query, projectPayload).lean()
                : await model.find(query).lean();
            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getManyItems: Recieved query result from: " +
                    model.collection.collectionName,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getSingleItem: Error occured while getting many items in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async addManyItems(
        model: Model<unknown>,
        payload: []
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.addManyItems: adding many items in: " +
                model.collection.collectionName,
                payload
            );

            const result = await model.insertMany(payload, { ordered: true });

            if (result) {
                logger.info(
                    "DATABASE_SERVICE.addManyItems: Added many items in " +
                    model.collection.collectionName,
                    result
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.addManyItems: Error occured while adding many items in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async updateItem(
        model: Model<unknown>,
        query: unknown,
        payload: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.updateItem: updating item in: " +
                model.collection.collectionName,
                payload
            );

            const updatedItem = await model.findOneAndUpdate(query, payload, {
                useFindAndModify: false,
                new: true,
                lean: true,
            });

            if (updatedItem) {
                logger.info(
                    "DATABASE_SERVICE.updateItem: Recieved updated item from: " +
                    model.collection.collectionName,
                    query,
                    payload,
                    updatedItem
                );
                return {
                    success: true,
                    payload: updatedItem,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.updateItem: Error occured while updating item in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async updateManyItem(
        model: Model<unknown>,
        query: unknown,
        payload: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.updateManyItem: updating many items in: " +
                model.collection.collectionName,
                payload
            );

            const updatedItem = await model.updateMany(query, payload, {
                useFindAndModify: false,
                new: true,
            });

            if (updatedItem) {
                logger.info(
                    "DATABASE_SERVICE.updateManyItem: Recieved updated items from: " +
                    model.collection.collectionName,
                    query,
                    payload
                );
                return {
                    success: true,
                    payload: updatedItem,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.updateManyItem: Error occured while updating many items in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async getDocumentCount(
        model: Model<unknown>,
        query: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.getDocumentCount: getting document counts from: " +
                model.collection.collectionName,
                query
            );

            const result: number = await model.countDocuments(query);
            if (result) {
                logger.info(
                    "DATABASE_SERVICE.getDocumentCount: Recieved document counts from: " +
                    model.collection.collectionName,
                    query
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.getDocumentCount: Error occured while getting document count in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }

    public async isExists(
        model: Model<unknown>,
        query: unknown
    ): Promise<DbResponseModel> {
        try {
            logger.info(
                "DATABASE_SERVICE.isExists: checking documents in: " +
                model.collection.collectionName,
                query
            );

            const result: boolean = await model.exists(query);
            if (result != undefined) {
                logger.info(
                    "DATABASE_SERVICE.isExists: Recieved query result from: " +
                    model.collection.collectionName,
                    query
                );
                return {
                    success: true,
                    payload: result,
                };
            }
        } catch (error) {
            logger.error(
                "DATABASE_SERVICE.isExists: Error occured while checking documents in: " +
                model.collection.collectionName,
                error
            );

            return {
                success: false,
                error: error,
            };
        }
    }
}
