import { GetStaticPaths, GetStaticProps } from 'next';

import { RichText } from 'prismic-dom';
import Link from 'next/link';
import Prismic from 'prismic-javascript';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';

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
      }[];
    }[];
  };
  timeToRead: number;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <article className={styles.post}>
          <img src={post.data.banner.url} alt={post.data.title} />
          <h1>{post.data.title}</h1>
          <time>
            {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
              locale: ptBR,
            }).toLowerCase()}
          </time>
          <span>{post.data.author}</span>
          {/* <time>{post.updatedAt}</time>

        <div
          className={`${styles.postContent} ${styles.previewContent}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className={styles.continueReading}>
          Wanna continue reading?
          <Link href="/home">
            <a>Subscribe now 🤗</a>
          </Link>
        </div> */}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
