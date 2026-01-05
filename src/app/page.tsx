import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--accent)" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.3" />
            </svg>
            <span className="font-semibold text-lg">normalized</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm">
              Документация
            </Link>
            <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm">
              Цены
            </Link>
            <Link href="/login" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm">
              Войти
            </Link>
            <Link
              href="/signup"
              className="bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--foreground)]/90 transition-colors"
            >
              Начать бесплатно
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1 rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse"></span>
            Данные хранятся в России
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Backend за
            <br />
            <span className="text-[var(--accent)]">5 минут</span>
          </h1>

          <p className="text-xl text-[var(--muted)] mb-10 max-w-2xl mx-auto">
            Postgres база данных, авторизация, хранилище файлов и realtime API.
            Без сервера. Без DevOps. Запустите MVP сегодня.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-[var(--accent)] text-[var(--background)] px-8 py-3 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              Создать проект
            </Link>
            <Link
              href="/docs"
              className="border border-[var(--border)] px-8 py-3 rounded-lg font-medium hover:bg-[var(--border)] transition-colors"
            >
              Документация
            </Link>
          </div>
        </div>
      </section>

      {/* Code preview */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#18181b] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              <span className="ml-4 text-sm text-[var(--muted)]">app.ts</span>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code>{`import { createClient } from '@normalized/client'

const db = createClient('YOUR_PROJECT_URL')

// Получить данные
const { data } = await db
  .from('posts')
  .select('*')
  .order('created_at', { desc: true })

// Авторизация
const { user } = await db.auth.signIn({
  phone: '+7 999 123 45 67'
})

// Загрузить файл
const { url } = await db.storage
  .upload('avatars/user.png', file)`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Всё что нужно для бэкенда</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="◉"
              title="Postgres"
              description="Полноценная база данных с SQL редактором и миграциями"
            />
            <FeatureCard
              icon="◈"
              title="Auth"
              description="Вход по телефону, email, Telegram и соцсетям"
            />
            <FeatureCard
              icon="◇"
              title="Storage"
              description="Файловое хранилище с CDN и трансформацией изображений"
            />
            <FeatureCard
              icon="◆"
              title="Realtime"
              description="WebSocket подписки на изменения в базе данных"
            />
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Простые цены</h2>
          <p className="text-[var(--muted)] mb-12">Начните бесплатно, платите по мере роста</p>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Free"
              price="0"
              features={["500 MB база данных", "1 GB хранилище", "50k запросов/мес"]}
            />
            <PricingCard
              name="Pro"
              price="1,490"
              features={["8 GB база данных", "50 GB хранилище", "Безлимит запросов"]}
              highlighted
            />
            <PricingCard
              name="Team"
              price="4,990"
              features={["32 GB база данных", "200 GB хранилище", "Branching, SSO"]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
          <p className="text-[var(--muted)] mb-8">Бесплатный тариф без ограничения по времени</p>
          <Link
            href="/signup"
            className="inline-block bg-[var(--accent)] text-[var(--background)] px-8 py-3 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--accent)" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.3" />
            </svg>
            normalized.ru
          </div>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="hover:text-[var(--foreground)]">Документация</Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)]">Конфиденциальность</Link>
            <Link href="/terms" className="hover:text-[var(--foreground)]">Условия</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors">
      <div className="text-2xl mb-4 text-[var(--accent)]">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)]">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, features, highlighted }: { name: string; price: string; features: string[]; highlighted?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border ${highlighted ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border)]'}`}>
      <div className="text-lg font-semibold mb-2">{name}</div>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-[var(--muted)]"> ₽/мес</span>
      </div>
      <ul className="space-y-2 text-sm text-[var(--muted)]">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-[var(--accent)]">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
