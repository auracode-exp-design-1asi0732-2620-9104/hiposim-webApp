<script setup lang="ts">
import { ref } from 'vue'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { mockProjects, mockAdvisors, formatProjectPrice, type ProjectStatus } from '@/features/properties/data/mock-properties'

const auth = useAuthStore()

const statusSeverity: Record<ProjectStatus, 'success' | 'info' | 'secondary'> = {
  Activo: 'success',
  'En Preventa': 'info',
  Agotado: 'secondary',
}

const profile = ref({
  name: auth.session?.companyName ?? 'Inmobiliaria ViraPerú',
  ruc: '20123456789',
  phone: '+51 987 654 321',
  email: 'contacto@viraperu.pe',
  address: 'Av. Brasil 1450, Jesús María, Lima',
  description:
    'Promotora inmobiliaria especializada en primera vivienda en Jesús María, La Molina y Surco, con más de 8 años de trayectoria.',
})
</script>

<template>
  <div class="page">
    <nav class="breadcrumb">
      <span>Portal Inmobiliarias</span> <i class="pi pi-angle-right" />
      <strong>Mi Inmobiliaria</strong>
    </nav>

    <section class="letterhead">
      <div class="letterhead__mark">{{ profile.name.slice(0, 2).toUpperCase() }}</div>
      <div class="letterhead__identity">
        <h1>{{ profile.name }}</h1>
        <span class="letterhead__ruc">RUC {{ profile.ruc }} <i class="pi pi-verified" /> Verificada</span>
      </div>
      <div class="letterhead__stats">
        <div><strong>{{ mockProjects.length }}</strong><span>Proyectos</span></div>
        <div class="letterhead__divider" />
        <div><strong>{{ mockProjects.reduce((s, p) => s + p.leadsCount, 0) }}</strong><span>Leads este mes</span></div>
        <div class="letterhead__divider" />
        <div><strong>{{ mockAdvisors.length }}</strong><span>Asesores</span></div>
      </div>
    </section>

    <div class="page__grid">
      <section class="card card--form">
        <h2>Ficha de la Inmobiliaria</h2>
        <div class="field">
          <label>Nombre comercial</label>
          <InputText v-model="profile.name" fluid />
        </div>
        <div class="field">
          <label>RUC</label>
          <InputText v-model="profile.ruc" fluid />
        </div>
        <div class="field">
          <label>Teléfono</label>
          <InputText v-model="profile.phone" fluid />
        </div>
        <div class="field">
          <label>Correo</label>
          <InputText v-model="profile.email" fluid />
        </div>
        <div class="field">
          <label>Dirección</label>
          <InputText v-model="profile.address" fluid />
        </div>
        <div class="field">
          <label>Descripción pública</label>
          <Textarea v-model="profile.description" rows="4" fluid />
        </div>
        <Button label="Guardar cambios" class="card--form__save" />
      </section>

      <section class="catalog">
        <div class="catalog__header">
          <h2>Catálogo de Proyectos</h2>
          <span>{{ mockProjects.length }} proyectos publicados</span>
        </div>

        <div class="catalog__strip">
          <article v-for="project in mockProjects" :key="project.id" class="project-card">
            <div
              class="project-card__cover"
              :style="{ background: `linear-gradient(135deg, ${project.accentFrom}, ${project.accentTo})` }"
            >
              <Tag :value="project.status" :severity="statusSeverity[project.status]" class="project-card__status" />
              <span class="project-card__leads" v-if="project.leadsCount"
                ><i class="pi pi-users" /> {{ project.leadsCount }} leads activos</span
              >
            </div>
            <div class="project-card__body">
              <strong>{{ project.name }}</strong>
              <span class="project-card__district">{{ project.district }}</span>
              <span class="project-card__price"
                >{{ formatProjectPrice(project.priceFrom) }} – {{ formatProjectPrice(project.priceTo) }}</span
              >
              <div class="project-card__meta">
                <span>{{ project.availableUnits }}/{{ project.totalUnits }} unidades disponibles</span>
                <span>{{ project.deliveryDate }}</span>
              </div>
            </div>
          </article>

          <button class="project-card project-card--add">
            <i class="pi pi-plus" />
            <span>Agregar Proyecto</span>
          </button>
        </div>
      </section>
    </div>

    <section class="card team">
      <div class="catalog__header">
        <h2>Equipo de Ventas</h2>
        <Button label="Invitar asesor" icon="pi pi-user-plus" size="small" severity="secondary" outlined />
      </div>
      <ul class="team__list">
        <li v-for="advisor in mockAdvisors" :key="advisor.id">
          <div class="team__avatar">{{ advisor.name.split(' ').map((n) => n[0]).slice(0, 2).join('') }}</div>
          <div class="team__info">
            <strong>{{ advisor.name }}</strong>
            <span>{{ advisor.role }} · en el equipo desde {{ advisor.activeSince }}</span>
          </div>
          <div class="team__leads">
            <strong>{{ advisor.leadsAssigned }}</strong>
            <span>leads asignados</span>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--panel-text);
  padding-bottom: 40px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--panel-text-muted);
}

.breadcrumb strong {
  color: var(--panel-text);
}

.letterhead {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.letterhead__mark {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: #ffffff;
  display: grid;
  place-items: center;
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  flex-shrink: 0;
}

.letterhead__identity {
  flex: 1;
  min-width: 200px;
}

.letterhead__identity h1 {
  font-size: 1.4rem;
}

.letterhead__ruc {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--color-success);
  margin-top: 4px;
}

.letterhead__stats {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.letterhead__stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.letterhead__stats strong {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  color: var(--color-primary);
}

.letterhead__stats span {
  font-size: 0.72rem;
  color: var(--panel-text-muted);
}

.letterhead__divider {
  width: 1px;
  height: 32px;
  background: var(--panel-border);
}

.page__grid {
  display: grid;
  grid-template-columns: 0.9fr 1.6fr;
  gap: var(--space-2);
  align-items: start;
}

.card {
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.card h2 {
  font-size: 1rem;
  margin-bottom: var(--space-2);
}

.card--form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.card--form__save {
  margin-top: 4px;
}

.catalog {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.catalog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.catalog__header h2 {
  font-size: 1rem;
}

.catalog__header span {
  font-size: 0.8rem;
  color: var(--panel-text-muted);
}

.catalog__strip {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: 6px;
}

.project-card {
  flex: 0 0 220px;
  background: var(--panel-surface);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.project-card__cover {
  height: 100px;
  padding: var(--space-1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.project-card__status {
  align-self: flex-start;
}

.project-card__leads {
  align-self: flex-end;
  color: #ffffff;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  padding: 2px 8px;
  border-radius: 999px;
}

.project-card__body {
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-card__body strong {
  font-size: 0.92rem;
  color: var(--panel-text);
}

.project-card__district {
  font-size: 0.76rem;
  color: var(--panel-text-muted);
}

.project-card__price {
  font-size: 0.82rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-top: 4px;
}

.project-card__meta {
  display: flex;
  flex-direction: column;
  font-size: 0.7rem;
  color: var(--panel-text-muted);
  margin-top: 6px;
}

.project-card--add {
  flex: 0 0 220px;
  border: 1px dashed var(--panel-border);
  border-radius: var(--radius-md);
  background: var(--panel-bg);
  color: var(--panel-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.85rem;
}

.project-card--add i {
  font-size: 1.4rem;
}

.project-card--add:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.team__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.team__list li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 12px 0;
  border-bottom: 1px solid var(--panel-border);
}

.team__list li:last-child {
  border-bottom: none;
}

.team__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--panel-surface-alt);
  color: var(--color-primary);
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.team__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.team__info strong {
  font-size: 0.9rem;
}

.team__info span {
  font-size: 0.78rem;
  color: var(--panel-text-muted);
}

.team__leads {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.team__leads strong {
  color: var(--color-primary);
  font-size: 1.1rem;
}

.team__leads span {
  font-size: 0.7rem;
  color: var(--panel-text-muted);
}
</style>
