import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
const readFileAsync = promisify(fs.readFile);

class MusicController {
  async saveAudio(request, response, next) {
    try {
      // Получение данных из формы
      const trackName = request.body.trackName ? request.body.trackName : 'Не указано';
      const trackAuthor = request.body.trackAuthor
        ? request.body.trackAuthor
        : 'Не указан';

      // Получение загруженных файлов
      const audioFile = request.files['audioFile']
        ? request.files['audioFile'][0]
        : null;
      if (!audioFile) {
        return response.status(400).json({ error: 'Вы не загрузили аудио' });
      }

      const imageFile = request.files['imageFile']
        ? request.files['imageFile'][0]
        : null;

      // Проверка наличия папки с требуемым именем
      const folderName = `${trackName}_${trackAuthor}_${request.user.id}`;
      const folderPath = path.join('uploads', folderName);
      if (fs.existsSync(folderPath)) {
        return response.status(400).json({ error: 'Папка уже существует' });
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
      response.status(200).json({ message: 'Файлы успешно сохранены' });
    } catch (error) {
      // Обработка ошибок
      console.error(error);
      response.status(500).json({ error: 'Что-то пошло не так' });
    }
  }

  async getAllTracks(request, response, next) {
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
      response.status(200).json(tracks);
    } catch (error) {
      // Обработка ошибок
      response.status(500).json({ error: 'Что-то пошло не так' });
    }
  }

  async getTrackByString(request, response, next) {
    try {
      const searchString = request.params.string.toLowerCase(); // Get the string parameter from the request and convert it to lowercase for case insensitivity
  
      const tracksDir = 'uploads'; // Folder where the tracks are stored
      const trackFolders = fs.readdirSync(tracksDir);
      const tracks = [];
  
      // Search for the track matching the string in each track folder
      for (const folder of trackFolders) {
        const folderPath = path.join(tracksDir, folder);
  
        if (fs.lstatSync(folderPath).isDirectory()) {
          // Read track information from the info.txt file
          const txtFilePath = path.join(folderPath, 'info.txt');
          const txtData = fs.readFileSync(txtFilePath, 'utf8');
  
          const lines = txtData.split('\n');
          const trackName = lines[0].split(':')[1].trim().toLowerCase(); // Get the track name and convert it to lowercase
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
          
          // Check if the track name contains the search string
          if (trackName.includes(searchString) || trackAuthor.includes(searchString)) {
            // Read track image and audio files
            // ...
  
            // Push the track information to the array of tracks
            tracks.push({ trackName, trackAuthor, trackImage, trackAudios });
          }
        }
      }
  
      // If tracks are found, return the array of tracks
      if (tracks.length > 0) {
        response.status(200).json(tracks);
      } else {
        // If no track is found, return a response indicating that no track was found
        response.status(404).json({ error: 'Track not found' });
      }
    } catch (error) {
      // Handle errors
      response.status(500).json({ error: 'Something went wrong' });
    }
  }
}

export const musicController = new MusicController();
