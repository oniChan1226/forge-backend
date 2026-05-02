import mongoose from "mongoose";

import { logger } from "../../config/logger";

export type TransactionCallback<T> = (session: mongoose.ClientSession) => Promise<T>;

/**
 * Executes a callback function within a MongoDB transaction.
 * Automatically handles session creation, transaction management, and cleanup.
 *
 * @param callback - Async function that receives the session and performs operations
 * @returns The result of the callback function
 * @throws Will throw an error if the transaction fails
 *
 * @example
 * ```typescript
 * const result = await withTransaction(async (session) => {
 *   const user = await UserModel.create([{ email: "test@example.com" }], { session });
 *   const token = await TokenModel.create([{ userId: user._id }], { session });
 *   return { user, token };
 * });
 * ```
 */
export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
  const session = await mongoose.connection.startSession();

  try {
    session.startTransaction();

    const result = await callback(session);

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error({ err: error }, "Transaction aborted due to error");
    throw error;
  } finally {
    await session.endSession();
  }
}

/**
 * Executes multiple operations atomically with retry logic.
 * Retries the entire transaction if it fails due to transient errors.
 *
 * @param callback - Async function that receives the session and performs operations
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns The result of the callback function
 * @throws Will throw an error if all retry attempts fail
 */
export async function withTransactionRetry<T>(
  callback: TransactionCallback<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is transient (can be retried)
      if (
        lastError.message.includes("WriteConflict") ||
        lastError.message.includes("NoSuchTransaction") ||
        lastError.message.includes("TransactionCoordinatorFailed")
      ) {
        logger.warn(
          { attempt, maxRetries, err: lastError },
          "Transient transaction error, retrying...",
        );
        if (attempt < maxRetries) continue;
      } else {
        // Non-transient error, fail immediately
        throw lastError;
      }
    }
  }

  logger.error(
    { attempts: maxRetries, err: lastError },
    "Transaction failed after max retries",
  );
  throw lastError || new Error("Transaction failed after max retries");
}
