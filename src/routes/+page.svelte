<script>
  import { onMount } from 'svelte';

  const features = [
    { name: "建立發票", link: "/invoice/create" },
    { name: "讀取發票", link: "/invoice/search" },
    { name: "管理客戶", link: "javascript:alert('建置中')" },
    { name: "查看報告", link: "javascript:alert('建置中')" },
  ];

  onMount(() => {
    console.log("Feature list component mounted with Tailwind CSS.");
  });
</script>

<div class="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4 sm:px-6 lg:px-8">
  <div class="bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-lg w-full">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">功能列表</h1>
    <ul class="space-y-4">
      {#each features as feature (feature.link)}
        <li>
          <a
            href={feature.link}
            class="group flex items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200
                   text-blue-700 hover:text-blue-800 transition duration-300 ease-in-out
                   transform hover:-translate-y-1 hover:shadow-md"
          >
            <span class="text-2xl mr-4 group-hover:animate-bounce">🚀</span> <span class="text-lg font-medium">{feature.name}</span>
          </a>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px); /* Smaller bounce for subtle effect */
    }
  }

  .group-hover\:animate-bounce:hover {
    animation: bounce 0.6s ease-in-out infinite; /* Apply bounce animation on hover */
  }
</style>