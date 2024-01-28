import {
  returnAllRecords,
  returnRecord,
  setRecord,
} from '../services/sqlwrapper.js';

class ProgramsController {
  //memory_numbers
  async returnAllRecords(request, response, next) {
    try {
      const chatsResponse = await returnAllRecords();
      response.json(chatsResponse);
    } catch (error) {
      next(error);
    }
  }

  async checkNewRecord(request, response, next) {
    try {
      const userId = request.user.id;
      const time = request.body.time;
      const grid = request.body.grid;
      const recordTime = await returnRecord(grid);
      // Разбиваем строки на компоненты
      const [minutes1, seconds1, milliseconds1] = time.split(':').map(Number);
      const [minutes2, seconds2, milliseconds2] = recordTime[0].time.split(':').map(Number);

      if (
        minutes1 < minutes2 ||
        (minutes1 === minutes2 && seconds1 < seconds2) ||
        (minutes1 === minutes2 &&
          seconds1 === seconds2 &&
          milliseconds1 < milliseconds2)
      ) {
        //рекорд поставлен
        const setRecordResult = await setRecord(userId, time, grid);
        response.json(setRecordResult);
      } else {
        //рекорд не поставлен
        response.json(false);
      }
    } catch (error) {
      next(error);
    }
  }
}

export const programsController = new ProgramsController();
