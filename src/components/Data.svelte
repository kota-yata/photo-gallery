<script lang="ts" context="module">
  const imageData: string[][] = [
    ['la', 'citadel', 'parking'],
    ['la', 'redondo', 'beach'],
    ['la', 'redondo', 'pier'],
    ['la', 'beverlyhills'],
    ['la', 'originalfarmersmarket', 'crowded'],
    ['mug', 'mac'],
    ['la', 'hollywood'],
    ['la', 'redondo', 'pier', 'fishing'],
    ['la', 'hollywood', 'shopping'],
    ['la', 'beverlyhills', 'park'],
    ['la', 'citadel', 'starbucks'],
    ['la', 'ucla'],
    ['la', 'ucla'],
    ['la', 'ucla'],
    ['la', 'santamonica', 'traffic'],
    ['la', 'santamonica'],
    ['la', 'santamonica'],
    ['la', 'santamonica', 'sea'],
    ['la', 'carlsbad', 'road'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['keyboard', 'hhkb'],
    ['microphone', 'marantz'],
    ['la', 'disneyland', 'anaheim'],
    ['la', 'redondo'],
    ['la', 'hollywood'],
    ['la', 'redondo', 'beach'],
    ['la', 'hollywood', 'roosevelthotel'],
    ['la', 'redondo', 'beach'],
    ['la', 'redondo', 'pier'],
    ['la', 'redondo', 'tree'],
    ['la', 'redondo', 'bike'],
  ];

  interface imageArray {
    index: number;
    tags: string[];
  }

  export const subjectArray: imageArray[] = [];

  for (let i = 0; i < imageData.length; i++) {
    subjectArray.push({
      index: i,
      tags: imageData[i],
    });
  }
</script>
