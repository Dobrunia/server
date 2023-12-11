import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import {
  returnPlaylistsByAuthor,
  saveAudioToPlaylist,
  savePlaylist,
} from '../services/sqlwrapper.js';
import { uuid } from 'uuidv4';
const readFileAsync = promisify(fs.readFile);

class MusicController {
  async saveAudio(request, response, next) {
    try {
      const trackName = request.body.trackName
        ? request.body.trackName
        : 'Не указано';
      const trackAuthor = request.body.trackAuthor
        ? request.body.trackAuthor
        : 'Не указан';

      const audioFile = request.files['audioFile']
        ? request.files['audioFile'][0]
        : null;
      if (!audioFile) {
        return response.status(400).json({ error: 'Вы не загрузили аудио' });
      }

      const imageFile = request.files['imageFile']
        ? request.files['imageFile'][0]
        : null;

      const trackId = uuid();
      const folderName = `${trackName}_${trackAuthor}_${trackId}`; // Генерация уникального id
      const folderPath = path.join('uploads', folderName);
      if (fs.existsSync(folderPath)) {
        return response.status(400).json({ error: 'Папка уже существует' });
      }

      if (audioFile) {
        fs.mkdirSync(folderPath);
      }

      const audioFileName = `${trackName}.mp3`;
      const imageFileName = `${trackName}.png`;

      if (audioFile) {
        fs.renameSync(audioFile.path, path.join(folderPath, audioFileName));
      }

      if (imageFile) {
        fs.renameSync(imageFile.path, path.join(folderPath, imageFileName));
      }

      const txtData = `id: ${trackId}\ntrackName: ${trackName}\ntrackAuthor: ${trackAuthor}`;
      fs.writeFileSync(path.join(folderPath, 'info.txt'), txtData);

      response.status(200).json({ message: 'Файлы успешно сохранены' });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: 'Что-то пошло не так' });
    }
  }

  async savePlaylist(request, response, next) {
    try {
      const DATA = {
        name: request.body.playlistName
          ? request.body.playlistName
          : 'Без названия',
        description: request.body.playlistDescription
          ? request.body.playlistDescription
          : '',
        img: request.file ? request.file.buffer : null,
        authorId: request.user.id,
      };
      const res = await savePlaylist(DATA);
      response.json(res);
    } catch (error) {
      next(error);
    }
  }

  async addAudioToPlaylist(request, response, next) {
    try {
      const res = await saveAudioToPlaylist(
        request.body.audioId,
        request.body.playlistId,
      );
      response.json(res);
    } catch (error) {
      next(error);
    }
  }

  async getAllTracks(request, response, next) {
    try {
      const tracksDir = 'uploads';
      const trackFolders = fs.readdirSync(tracksDir);
      const tracks = [];

      for (const folder of trackFolders) {
        const folderPath = path.join(tracksDir, folder);

        if (fs.lstatSync(folderPath).isDirectory()) {
          const txtFilePath = path.join(folderPath, 'info.txt');
          const txtData = fs.readFileSync(txtFilePath, 'utf8');

          const lines = txtData.split('\n');
          const trackId = lines[0].split(':')[1].trim();
          const trackName = lines[1].split(':')[1].trim();
          const trackAuthor = lines[2].split(':')[1].trim();

          const imageFiles = fs
            .readdirSync(folderPath)
            .filter(
              (file) =>
                file.endsWith('.png') ||
                file.endsWith('.jpg') ||
                file.endsWith('.jpeg'),
            );

          let trackImage = null;
          if (imageFiles.length > 0) {
            const imageFilePath = path.join(folderPath, imageFiles[0]);
            const imageData = await readFileAsync(imageFilePath, 'base64'); // Открываем файл как base64
            trackImage = imageData.toString();
          }

          const audioFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith('.mp3'));

          const trackAudios = [];
          if (audioFiles.length > 0) {
            for (const audioFile of audioFiles) {
              const audioFilePath = path.join(folderPath, audioFile);
              const audioData = await readFileAsync(audioFilePath, 'base64'); // Открываем файл как base64
              const base64Audio = audioData.toString();
              const audioName = audioFile.replace('.mp3', '');
              trackAudios.push({ audioName, base64Audio });
            }
          }

          tracks.push({
            trackId,
            trackName,
            trackAuthor,
            trackImage,
            trackAudios,
          });
        }
      }

      response.status(200).json(tracks);
    } catch (error) {
      response.status(500).json({ error: 'Что-то пошло не так' });
    }
  }

  async getTrackByString(request, response, next) {
    try {
      const searchString = request.params.string.toLowerCase();

      const tracksDir = 'uploads';
      const trackFolders = fs.readdirSync(tracksDir);
      const tracks = [];

      for (const folder of trackFolders) {
        const folderPath = path.join(tracksDir, folder);

        if (fs.lstatSync(folderPath).isDirectory()) {
          const txtFilePath = path.join(folderPath, 'info.txt');
          const txtData = fs.readFileSync(txtFilePath, 'utf8');

          const lines = txtData.split('\n');
          const trackId = lines[0].split(':')[1].trim();
          const trackName = lines[1].split(':')[1].trim();
          const trackAuthor = lines[2].split(':')[1].trim();

          const imageFiles = fs
            .readdirSync(folderPath)
            .filter(
              (file) =>
                file.endsWith('.png') ||
                file.endsWith('.jpg') ||
                file.endsWith('.jpeg'),
            );

          let trackImage = null;
          if (imageFiles.length > 0) {
            const imageFilePath = path.join(folderPath, imageFiles[0]);
            const imageData = await readFileAsync(imageFilePath, 'base64'); // Открываем файл как base64
            trackImage = imageData.toString();
          }

          const audioFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith('.mp3'));

          const trackAudios = [];
          if (audioFiles.length > 0) {
            for (const audioFile of audioFiles) {
              const audioFilePath = path.join(folderPath, audioFile);
              const audioData = await readFileAsync(audioFilePath, 'base64'); // Открываем файл как base64
              const base64Audio = audioData.toString();
              const audioName = audioFile.replace('.mp3', '');
              trackAudios.push({ audioName, base64Audio });
            }
          }

          if (
            trackName.includes(searchString) ||
            trackAuthor.includes(searchString)
          ) {
            tracks.push({
              trackId,
              trackName,
              trackAuthor,
              trackImage,
              trackAudios,
            });
          }
        }
      }

      if (tracks.length > 0) {
        response.status(200).json(tracks);
      } else {
        response.status(404).json({ error: 'Track not found' });
      }
    } catch (error) {
      response.status(500).json({ error: 'Something went wrong' });
    }
  }

  async getTrackBySongsArray(request, response, next) {
    try {
      const songsArray = request.params.songsarray.split('_'); // Разделение строки на id треков
      const tracksDir = 'uploads';
      const trackFolders = fs.readdirSync(tracksDir);
      const tracks = [];

      for (const folder of trackFolders) {
        const folderPath = path.join(tracksDir, folder);

        if (fs.lstatSync(folderPath).isDirectory()) {
          const txtFilePath = path.join(folderPath, 'info.txt');
          const txtData = fs.readFileSync(txtFilePath, 'utf8');

          const lines = txtData.split('\n');
          const trackId = lines[0].split(':')[1].trim();
          const trackName = lines[1].split(':')[1].trim();
          const trackAuthor = lines[2].split(':')[1].trim();

          const imageFiles = fs
            .readdirSync(folderPath)
            .filter(
              (file) =>
                file.endsWith('.png') ||
                file.endsWith('.jpg') ||
                file.endsWith('.jpeg'),
            );

          let trackImage = null;
          if (imageFiles.length > 0) {
            const imageFilePath = path.join(folderPath, imageFiles[0]);
            const imageData = await readFileAsync(imageFilePath, 'base64');
            trackImage = imageData.toString();
          }

          const audioFiles = fs
            .readdirSync(folderPath)
            .filter((file) => file.endsWith('.mp3'));

          const trackAudios = [];
          if (audioFiles.length > 0) {
            for (const audioFile of audioFiles) {
              const audioFilePath = path.join(folderPath, audioFile);
              const audioData = await readFileAsync(audioFilePath, 'base64');
              const base64Audio = audioData.toString();
              const audioName = audioFile.replace('.mp3', '');
              trackAudios.push({ audioName, base64Audio });
            }
          }

          // Проверяем, содержится ли id трека в songsArray
          const trackContained = songsArray.some((id) =>
            folder.includes(id.trim()),
          );

          if (trackContained) {
            tracks.push({
              trackId,
              trackName,
              trackAuthor,
              trackImage,
              trackAudios,
            });
          }
        }
      }

      if (tracks.length > 0) {
        response.status(200).json(tracks);
      } else {
        response.status(404).json({ error: 'Track not found' });
      }
    } catch (error) {
      response.status(500).json({ error: 'Something went wrong' });
    }
  }

  async returnMyPlaylists(request, response, next) {
    try {
      const playlists_response = await returnPlaylistsByAuthor(request.user.id);
      playlists_response.forEach((elem) => {
        elem.img = elem.img.toString('base64');
      });
      response.json(playlists_response);
    } catch (error) {
      next(error);
    }
  }
}

export const musicController = new MusicController();
