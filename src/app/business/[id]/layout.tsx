import { supabase } from "@/lib/supabaseClient";
import { Metadata } from "next";

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await supabase
      .from("businesses")
      .select("name, location")
      .eq("id", params.id)
      .single();

    if (data) {
      return {
        title: `${data.name} | tookdeal`,
        description: `Visit ${data.name} in ${data.location || 'your area'} - Find details, reviews, and contact information on tookdeal`,
        openGraph: {
          title: `${data.name} | tookdeal`,
          description: `Visit ${data.name} in ${data.location || 'your area'}`,
        },
      };
    }
  } catch (error) {
    console.error("Error fetching business for metadata:", error);
  }

  // Fallback metadata if business not found
  return {
    title: "Business Details | tookdeal",
    description: "View business details on tookdeal",
  };
}

export default function BusinessLayout({ children }: Props) {
  return children;
}