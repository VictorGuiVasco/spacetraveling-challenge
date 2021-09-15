import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { first_publication_date, data } = post;

  return (
    <div className={styles.container}>
      <Header />

      <img src={data.banner.url} alt="banner" />

      <main className={styles.content}>
        <h1>{data.title}</h1>

        <div className={styles.info}>
          <div>
            <FiCalendar size={24} color="#DDDDDD" />
            <span>{first_publication_date}</span>
          </div>

          <div>
            <FiUser size={24} color="#DDDDDD" />
            <span>{data.author}</span>
          </div>

          <div>
            <FiClock size={24} color="#DDDDDD" />
            <span>4 min</span>
          </div>
        </div>

        {data.content.map(content => (
          <div key={content.heading} className={styles.postContent}>
            <h1>{content.heading}</h1>

            <div dangerouslySetInnerHTML={{ __html: content.body.text }} />
          </div>
        ))}
      </main>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: {
          text: RichText.asHtml(content.body),
        },
      })),
    },
  };

  return {
    props: { post },
  };
};
