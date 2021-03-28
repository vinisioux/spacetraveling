import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  // TODO

  // function loadMorePostsButton() {
  //   console.log('a');
  // }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
                <span>{post.data.subtitle}</span>
                <div className={styles.details}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd LLL yyyy',
                        {
                          locale: ptBR,
                        }
                      ).toLowerCase()}
                    </time>
                    {/* <time>{post.first_publication_date}</time> */}
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {/* <button type="button" onClick={loadMorePostsButton}>
          Carregar mais posts
        </button> */}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['publication.title', 'publication.content'],
      pageSize: 20,
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      // first_publication_date: format(
      //   new Date(post.first_publication_date),
      //   'dd iiiiii yyyy',
      //   {
      //     locale: ptBR,
      //   }
      // ),
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
