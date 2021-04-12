import { Left, Maybe, Right } from 'fputils';
import { Database, sqlite3 } from 'sqlite3';

/**
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
 *
 * @param {Database} db
 * @param {string} sql
 * @param {any[]} params
 * @return {Promise<Maybe<T>>}
 */
export const get = <T>(db: Database, sql: string, params: any[] = []): Promise<Maybe<T>> =>
    new Promise((resolve) => {
        db.get(sql, params, (err: Error, result: T) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(result));
        });
    });


/**
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
