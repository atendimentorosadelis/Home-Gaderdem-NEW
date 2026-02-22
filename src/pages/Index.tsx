import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { PostsGrid } from "@/components/home/PostsGrid";
import { usePublishedArticles } from "@/hooks/use-published-articles";
import type { Post } from "@/components/home/PostCard";

const Index = () => {
  const { data: publishedArticles = [] } = usePublishedArticles();

  // Use only database articles, limit to 6
  const posts: Post[] = publishedArticles.slice(0, 6);

  return (
    <Layout fullWidth>
      <Hero />
      <Stats />
      <PostsGrid
        posts={posts}
        useTranslatedTitles
      />
    </Layout>
  );
};

export default Index;
