import { isLeft, Left, Maybe, Optional, Right } from 'fputils';
import { Database, sqlite3 } from 'sqlite3';

/**
 * Returns a new Database object and automatically opens the database
 *
 * @param {sqlite3} engine
 * @param {string} filename
 * @return {Promise<Maybe<Database>>}
 */
export const getDatabase = async (engine: sqlite3, filename: string): Promise<Maybe<Database>> =>
    new Promise((resolve) => {
        const database = new engine.Database(filename, (error) => {
            if (error) {
                return resolve(Left(error));
            }
            resolve(Right(database));
        });
    });

/**
 * Runs the SQL query. It does not retrieve any result data, but last inserted `id`
 *
 * @param {Database} db
 * @param {string} sql
 * @param {any[]} params
 * @return {Promise<Maybe<number>>}
 */
export const run = (db: Database, sql: string, params: any[] = []): Promise<Maybe<number>> =>
    new Promise((resolve) => {
        db.run(sql, params, function (this: any, error: Error) {
            if (error) {
                return resolve(Left(error));
            }
            return resolve(Right(this.lastID));
        })
    });

/**
 * Runs the SQL query. Result is an object containing the values for the first row.
 *
 * @param {Database} db
 * @param {string} sql
 * @param {any[]} params
 * @return {Promise<Maybe<Optional<T>>>}
 */
export const get = <T>(db: Database, sql: string, params: any[] = []): Promise<Maybe<Optional<T>>> =>
    new Promise((resolve) => {
        db.get(sql, params, (err: Error, result: T) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(result));
        });
    });


/**
 * Runs the SQL query. Returned rows is an array.
 *
 * @param {Database} db
 * @param {string} sql
 * @param {any[]} params
 * @return {Promise<Maybe<T[]>>}
 */
export const all = <T>(db: Database, sql: string, params: any[] = []): Promise<Maybe<T[]>> =>
    new Promise((resolve) => {
        db.all(sql, params, (err: Error, rows) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(rows));
        });
    });

/**
 *
 * @param {Database} db
 * @param {string} sql
 * @param {Array<Array<any>>} params
 * @return {Promise<Maybe<undefined>>}
 */
export const prepare = (db: Database, sql: string, params: Array<Array<any>>): Promise<Maybe<undefined>> => new Promise((resolve) => {
        const stmt = db.prepare(sql, (e) => {
            if (e) {
                return resolve(Left(e));
            }
            params.reduce<any>((al, current) => stmt.run(current), 0);

            stmt.finalize((error) => {
                if (error) {
                    return resolve(Left(error));
                }
                resolve(Right(undefined));
            });
        });
    });


/**
 *
 * @param {Database} db
 * @param {string[]} statements
 * @return {Promise<Maybe<void>>}
 */
export const runBatch = async (db: Database, statements: string[]): Promise<Maybe<void>> => {
    const batch = ['BEGIN', ...statements, 'COMMIT'];

    let i = 0;
    while (i < batch.length) {
        const result = await run(db, batch[i]);
        if (isLeft(result)) {
            const rollback = await run(db, 'ROLLBACK');
            if (isLeft(rollback)) {
                return Left(new Error(`Error while rollback: ${rollback.value.message}`));
            }

            return Left(new Error(result.value.message + ' in statement: ' + batch[i]))
        }
        i++;
    }

    return Right(undefined)
};
