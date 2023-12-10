import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
const readFileAsync = promisify(fs.readFile);

class MusicController {
  async saveAudio(req, res, next) {
    try {
      // Получение данных из формы
      const trackName = req.body.trackName ? req.body.trackName : 'Не указано';
      const trackAuthor = req.body.trackAuthor
        ? req.body.trackAuthor
        : 'Не указан';

      // Получение загруженных файлов
      const audioFile = req.files['audioFile']
        ? req.files['audioFile'][0]
        : null;
      if (!audioFile) {
        return res.status(400).json({ error: 'Вы не загрузили аудио' });
      }

      const imageFile = req.files['imageFile']
        ? req.files['imageFile'][0]
        : null;

      // Проверка наличия папки с требуемым именем
      const folderName = `${trackName}_${trackAuthor}_${req.user.id}`;
      const folderPath = path.join('uploads', folderName);
      if (fs.existsSync(folderPath)) {
        return res.status(400).json({ error: 'Папка уже существует' });
      }

      // Создание новой папки
      if (audioFile) {
        fs.mkdirSync(folderPath);
      }

      // Создание нового имени для сохраняемых файлов
      const audioFileName = `${trackName}.mp3`;
      const imageFileName = `${trackName}.png`;

      // Перемещение аудиофайла в нужную папку
      if (audioFile) {
        fs.renameSync(audioFile.path, path.join(folderPath, audioFileName));
      }

      // Перемещение изображения, если оно было загружено
      if (imageFile) {
        fs.renameSync(imageFile.path, path.join(folderPath, imageFileName));
      }

      // Создание текстового файла
      const txtData = `trackName: ${trackName}\ntrackAuthor: ${trackAuthor}`;
      fs.writeFileSync(path.join(folderPath, 'info.txt'), txtData);

      // Возврат ответа с информацией о сохранении
      res.status(200).json({ message: 'Файлы успешно сохранены' });
    } catch (error) {
      // Обработка ошибок
      console.error(error);
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  }

  async getAllTracks(req, res, next) {
    try {
      const tracksDir = 'uploads'; // Папка, где хранятся все треки
      const trackFolders = fs.readdirSync(tracksDir);

      // Создание массива для хранения данных о треках
      const tracks = [];

      // Обход всех папок (треков)
      for (const folder of trackFolders) {
        const folderPath = path.join(tracksDir, folder);

        // Проверка, является ли элемент папкой
        if (fs.lstatSync(folderPath).isDirectory()) {
          // Чтение информации из текстового файла
          const txtFilePath = path.join(folderPath, 'info.txt');
          const txtData = fs.readFileSync(txtFilePath, 'utf8');

          // Разбиение данных на строки и чтение полей
          const lines = txtData.split('\n');
          const trackName = lines[0].split(':')[1].trim();
          const trackAuthor = lines[1].split(':')[1].trim();

          // Поиск изображения в папке трека
          const imageFiles = fs
            .readdirSync(folderPath)
            .filter(
              (file) =>
                file.endsWith('.png') ||
                file.endsWith('.jpg') ||
                file.endsWith('.jpeg'),
            );

          // Проверка наличия изображения в папке
          let trackImage = null;
          if (imageFiles.length > 0) {
            const imageFilePath = path.join(folderPath, imageFiles[0]);
            const imageData = await readFileAsync(imageFilePath);
            trackImage = imageData.toString('base64');
          }

          // Поиск аудиофайлов mp3 в папке трека
          const audioFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith('.mp3'));

          // Проверка наличия аудиофайлов в папке
          const trackAudios = [];
          if (audioFiles.length > 0) {
            for (const audioFile of audioFiles) {
              const audioFilePath = path.join(folderPath, audioFile);
              const audioData = await readFileAsync(audioFilePath);
              const base64Audio = audioData.toString('base64');
              const audioName = audioFile.replace('.mp3', '');
              trackAudios.push({ audioName, base64Audio });
            }
          }

          // Добавление данных о треке, изображении и аудиофайлах в массив
          tracks.push({ trackName, trackAuthor, trackImage, trackAudios });
        }
      }

      // Отправка массива треков в качестве ответа
      res.status(200).json(tracks);
    } catch (error) {
      // Обработка ошибок
      res.status(500).json({ error: 'Что-то пошло не так' });
    }
  }
}

export const musicController = new MusicController();
