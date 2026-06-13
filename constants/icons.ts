import activity from "@/assets/icons/activity.png";
import add from "@/assets/icons/add.png";
import adobe from "@/assets/icons/adobe.png";
import canva from "@/assets/icons/canva.png";
import claude from "@/assets/icons/claude.png";
import figma from "@/assets/icons/figma.png";
import github from "@/assets/icons/github.png";
import home from "@/assets/icons/home.png";
import medium from "@/assets/icons/medium.png";
import music from "@/assets/icons/music.png";
import notion from "@/assets/icons/notion.png";
import setting from "@/assets/icons/setting.png";
import wallet from "@/assets/icons/wallet.png";

export const icons = {
  home,
  wallet,
  setting,
  activity,
  add,
  notion,
  adobe,
  medium,
  figma,
  music,
  github,
  claude,
  canva,
} as const;

export type IconKey = keyof typeof icons;
