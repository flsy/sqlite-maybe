import { Left, Maybe, Right } from 'fputils';
import { Database, sqlite3 } from 'sqlite3';

export const getDatabase = async (engine: sqlite3, filename: string): Promise<Maybe<Database>> =>
    new Promise((resolve) => {
        const database = new engine.Database(filename, (error) => {
            if (error) {
                return resolve(Left(error));
            }
            resolve(Right(database));
        });
    });

export const run = (db: Database, sql: string, params: any[] = []): Promise<Maybe<number>> =>
    new Promise((resolve) => {
        db.run(sql, params, function (this: any, error: Error) {
            if (error) {
                return resolve(Left(error));
            }
            return resolve(Right(this.lastID));
        })
    });

export const get = <T>(db: Database, sql: string, params: any[] = []): Promise<Maybe<T>> =>
    new Promise((resolve) => {
        db.get(sql, params, (err: Error, result: T) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(result));
        });
    });



export const all = <T>(db: Database, sql: string, params: any[] = []): Promise<Maybe<T[]>> =>
    new Promise((resolve) => {
        db.all(sql, params, (err: Error, rows) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(rows));
        });
    });

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
