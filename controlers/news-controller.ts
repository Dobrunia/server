import axios, {isCancel, AxiosError} from 'axios';
import * as cheerio from 'cheerio';

class NewsController {
  //memory_numbers
  async returnCnnNews(request, response, next) {
    try {
      function generateUrl() {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear()).slice(-2);
        return `https://edition.cnn.com/middleeast/live-news/israel-hamas-war-gaza-news-${month}-${day}-${year}/index.html`;
      }

      const newsPostsArray = [];

      axios
        .get(generateUrl())
        .then((res) => {
          const html = res.data;
          let $ = cheerio.load(html);

          $('.sc-bwzfXH.sc-eXEjpC.iGQwpp').each((index, element) => {
            // Получение содержимого каждого элемента
            const content = $(element).text(); // Получение текстового содержимого элемента

            // Помещение элемента и его содержимого в массив
            newsPostsArray.push({ element: $(element).html(), content });
          });

          response.json(newsPostsArray);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      next(error);
    }
  }
}

export const newsController = new NewsController();
