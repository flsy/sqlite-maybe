import { Left, Maybe, Right } from 'fputils';
import { Database } from 'sqlite3';

export const run = <Params>(db: Database, sql: string, params: Params[] = []): Promise<Maybe<number>> =>
    new Promise((resolve) => {
        db.run(sql, params, function (this: any, error: Error) {
            if (error) {
                return resolve(Left(error));
            }
            return resolve(Right(this.lastID));
        })
    });

export const get = <Params, T>(db: Database, sql: string, params: Params[] = []): Promise<Maybe<T>> =>
    new Promise((resolve) => {
        db.get(sql, params, (err: Error, result: T) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(result));
        });
    });



export const all = <Params, T>(db: Database, sql: string, params: Params[] = []): Promise<Maybe<T[]>> =>
    new Promise((resolve) => {
        db.all(sql, params, (err: Error, rows) => {
            if (err) {
                return resolve(Left(err));
            }
            resolve(Right(rows));
        });
    });

export const prepare = <Params>(db: Database, sql: string, params: Array<Array<Params>>): Promise<Maybe<undefined>> => new Promise((resolve) => {
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
