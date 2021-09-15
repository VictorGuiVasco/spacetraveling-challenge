import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const { next_page, results } = postsPagination;

  const [next_pageState, setNext_PageState] = useState(next_page);
  const [resultsState, setResults] = useState(results);

  async function fetchNextPage() {
    let tempArr = results.splice(0);
    try {
      const response = await fetch(next_pageState);
      const data = await response.json();

      tempArr = tempArr.concat(data.results);

      setNext_PageState(data.next_page);
      setResults(tempArr);
    } catch {}
  }

  return (
    <div className={commonStyles.container}>
      <main className={commonStyles.content}>
        <img src="/logo.svg" alt="logo" />

        {resultsState.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`} >
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.info}>
                  <div>
                    <FiCalendar size={24} color="#DDDDDD" />
                    <span>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </span>
                  </div>

                  <div>
                    <FiUser size={24} color="#DDDDDD" />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        ))}

        {next_pageState && (
          <button
            type="button"
            className={styles.button}
            onClick={fetchNextPage}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author', 'posts.content'],
      pageSize: 1,
    }
  );

  return {
    props: { postsPagination: postResponse },
  };
};
