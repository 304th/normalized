import Link from "next/link";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["64 MB БД", "256 MB Storage", "Shared", "1 проект"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 990,
    features: ["5 GB БД", "10 GB Storage", "Shared", "3 проекта", "Бэкапы"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 2990,
    popular: true,
    features: ["20 GB БД", "50 GB Storage", "Dedicated", "10 проектов", "Бэкапы"],
  },
  {
    id: "business",
    name: "Business",
    price: 9990,
    features: ["100 GB БД", "200 GB Storage", "Dedicated", "∞ проектов", "SLA 99.9%"],
  },
];

const faqs = [
  {
    q: "Можно ли сменить тариф?",
    a: "Да, вы можете перейти на более высокий тариф в любой момент. Данные сохраняются, происходит короткий перерыв (~2 мин) для миграции.",
  },
  {
    q: "Что происходит при превышении лимитов?",
    a: "Мы уведомим вас заранее. Сервис продолжит работать, но рекомендуем перейти на следующий тариф.",
  },
  {
    q: "Есть ли годовая скидка?",
    a: "Да, при оплате за год вы получаете 2 месяца бесплатно (скидка ~17%).",
  },
  {
    q: "Где хранятся данные?",
    a: "Все данные хранятся в дата-центрах на территории РФ (Москва, Санкт-Петербург) в соответствии с 152-ФЗ.",
  },
  {
    q: "Какие способы оплаты?",
    a: "Банковские карты (Visa, Mastercard, МИР), ЮKassa, банковский перевод для юрлиц.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--accent)" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.3" />
            </svg>
            <span className="font-semibold text-lg">normalized</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/docs" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm">
              Документация
            </Link>
            <Link href="/pricing" className="text-[var(--foreground)] text-sm">
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
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Простые и прозрачные цены
          </h1>
          <p className="text-xl text-[var(--muted)]">
            Начните бесплатно, масштабируйтесь по мере роста
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl border p-6 ${
                  plan.popular
                    ? "border-[var(--accent)] bg-[var(--accent)]/5 relative"
                    : "border-[var(--border)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--background)] text-xs font-medium px-3 py-1 rounded-full">
                    Популярный
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>

                <div className="mb-5">
                  <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                  <span className="text-[var(--muted)]"> ₽/мес</span>
                </div>

                <ul className="space-y-2 text-sm mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[var(--accent)]">✓</span>
                      <span className="text-[var(--muted)]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)]"
                      : "border border-[var(--border)] hover:bg-[var(--card)]"
                  }`}
                >
                  {plan.price === 0 ? "Начать" : "Выбрать"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Сравнение тарифов</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-4 pr-4 font-medium">Возможность</th>
                  <th className="text-center py-4 px-4 font-medium">Free</th>
                  <th className="text-center py-4 px-4 font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-medium text-[var(--accent)]">Pro</th>
                  <th className="text-center py-4 px-4 font-medium">Business</th>
                </tr>
              </thead>
              <tbody className="text-[var(--muted)]">
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">База данных</td>
                  <td className="text-center py-4 px-4">64 MB</td>
                  <td className="text-center py-4 px-4">5 GB</td>
                  <td className="text-center py-4 px-4">20 GB</td>
                  <td className="text-center py-4 px-4">100 GB</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">Хранилище файлов</td>
                  <td className="text-center py-4 px-4">256 MB</td>
                  <td className="text-center py-4 px-4">10 GB</td>
                  <td className="text-center py-4 px-4">50 GB</td>
                  <td className="text-center py-4 px-4">200 GB</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">Тип кластера</td>
                  <td className="text-center py-4 px-4">Shared</td>
                  <td className="text-center py-4 px-4">Shared</td>
                  <td className="text-center py-4 px-4">Dedicated</td>
                  <td className="text-center py-4 px-4">Dedicated</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">Проекты</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">3</td>
                  <td className="text-center py-4 px-4">10</td>
                  <td className="text-center py-4 px-4">∞</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">Бэкапы</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">Ежедневно</td>
                  <td className="text-center py-4 px-4">Ежедневно</td>
                  <td className="text-center py-4 px-4">Ежечасно</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">SLA</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">99%</td>
                  <td className="text-center py-4 px-4">99.9%</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="py-4 pr-4">Поддержка</td>
                  <td className="text-center py-4 px-4">Community</td>
                  <td className="text-center py-4 px-4">Email</td>
                  <td className="text-center py-4 px-4">Приоритет</td>
                  <td className="text-center py-4 px-4">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Частые вопросы</h2>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[var(--border)] rounded-xl p-6">
                <h3 className="font-medium mb-2">{faq.q}</h3>
                <p className="text-sm text-[var(--muted)]">{faq.a}</p>
              </div>
            ))}
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
