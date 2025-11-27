import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://kurselrfgbnyhnmrlltq.supabase.co",
  "sb_publishable__j_RUscp-8RfdqnCEeXiJg_DEvRpNQ-" // public key
);

const main = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "test2@nous.com",
    password: "123456", 
  });

  console.log("JWT:", data.session.access_token);
};

main();