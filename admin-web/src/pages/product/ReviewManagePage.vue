<template>
  <section class="admin-card">
    <div class="card-head">
      <div class="filter-row">
        <el-input v-model="filters.keyword" placeholder="商品 / 用户 / 内容" clearable @keyup.enter="fetchReviews" />
        <el-select v-model="filters.rating" clearable placeholder="评分" @change="fetchReviews">
          <el-option v-for="star in 5" :key="star" :label="`${star} 星`" :value="star" />
        </el-select>
        <el-select v-model="filters.replyStatus" clearable placeholder="回复状态" @change="fetchReviews">
          <el-option label="已回复" value="replied" />
          <el-option label="未回复" value="pending" />
        </el-select>
        <el-button @click="fetchReviews">查询</el-button>
      </div>
    </div>

    <el-table :data="reviews" stripe>
      <el-table-column prop="productName" label="商品" min-width="190" />
      <el-table-column prop="userName" label="用户" width="120" />
      <el-table-column label="评分" width="110">
        <template #default="{ row }">{{ '★'.repeat(row.rating) }}</template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" min-width="260" />
      <el-table-column label="商家回复" min-width="220">
        <template #default="{ row }">{{ row.reply || '未回复' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :disabled="!auth.canWrite" @click="openReply(row)">回复</el-button>
          <el-popconfirm title="确认删除该评价？" @confirm="remove(row.id)">
            <template #reference>
              <el-button link type="danger" :disabled="!auth.canWrite">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager-row">
      <el-pagination
        v-model:current-page="filters.page"
        v-model:page-size="filters.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        @current-change="fetchReviews"
        @size-change="fetchReviews"
      />
    </div>
  </section>

  <el-drawer v-model="drawer" title="回复评价" size="460px">
    <el-form label-position="top">
      <el-form-item label="评价内容">
        <el-input :model-value="current?.content" type="textarea" :rows="3" disabled />
      </el-form-item>
      <el-form-item label="商家回复">
        <el-input v-model="reply" type="textarea" :rows="5" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawer = false">取消</el-button>
      <el-button type="primary" :disabled="!auth.canWrite" @click="saveReply">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { adminApi } from '../../api/admin';
import { useAdminAuthStore } from '../../stores/auth';

const auth = useAdminAuthStore();
const reviews = ref([]);
const pagination = ref({ total: 0 });
const drawer = ref(false);
const current = ref(null);
const reply = ref('');
const filters = reactive({ keyword: '', rating: '', replyStatus: '', page: 1, pageSize: 10 });

async function fetchReviews() {
  const res = await adminApi.reviews(filters);
  reviews.value = res.data.list;
  pagination.value = res.data.pagination;
}

function openReply(row) {
  if (!auth.canWrite) return;
  current.value = row;
  reply.value = row.reply || '';
  drawer.value = true;
}

async function saveReply() {
  if (!auth.canWrite || !current.value) return;
  await adminApi.replyReview(current.value.id, { reply: reply.value });
  drawer.value = false;
  await fetchReviews();
}

async function remove(id) {
  if (!auth.canWrite) return;
  await adminApi.deleteReview(id);
  await fetchReviews();
}

onMounted(fetchReviews);
</script>
