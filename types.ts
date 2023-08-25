import mysql, {
  FieldPacket,
  OkPacket,
  ProcedureCallPacket,
  QueryError,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2';

export type Response = {
  err: QueryError | null;
  results:
    | OkPacket
    | RowDataPacket[]
    | ResultSetHeader[]
    | RowDataPacket[][]
    | OkPacket[]
    | ProcedureCallPacket;
  fields: FieldPacket[];
};
