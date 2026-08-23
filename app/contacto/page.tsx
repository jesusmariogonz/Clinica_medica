import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | Dra. Maggie Morales",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-6 py-24 sm:px-10 lg:grid-cols-2">
      <div>
        <span className="text-xs font-medium tracking-wide uppercase text-rosa-fuerte">
          Contacto
        </span>
        <h1 className="mt-3 font-serif text-3xl text-carbon sm:text-4xl">
          Agenda tu valoración
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-carbon/70">
          Escríbenos y con gusto te ayudamos a encontrar el tratamiento
          adecuado para ti.
        </p>

        <dl className="mt-10 space-y-6 text-sm text-carbon/80">
          <div>
            <dt className="font-medium text-carbon">Ubicación</dt>
            <dd className="mt-1 text-carbon/60">
              Bolivia 563, Col. Latinoamericana, C.P. 25270, Saltillo, Coahuila, México
            </dd>
          </div>
          <div>
            <dt className="font-medium text-carbon">Teléfono / WhatsApp</dt>
            <dd className="mt-1 text-carbon/60">
              <a href="https://wa.me/528441602304" className="hover:text-rosa-fuerte">
                +52 844 160 2304
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-carbon">Correo</dt>
            <dd className="mt-1 text-carbon/60">
              <a href="mailto:sandramormart@gmail.com" className="hover:text-rosa-fuerte">
                sandramormart@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-carbon">Horario</dt>
            <dd className="mt-1 text-carbon/60">
              Lunes a viernes de 10:00 a 18:00 · Sábados de 10:00 a 14:00
            </dd>
          </div>
        </dl>
      </div>

      <form className="space-y-5 rounded-3xl border border-rosa-suave/50 bg-white/50 p-8 backdrop-blur-sm">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-carbon">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="text-sm font-medium text-carbon">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
          />
        </div>
        <div>
          <label htmlFor="mensaje" className="text-sm font-medium text-carbon">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            rows={4}
            required
            className="mt-2 w-full rounded-xl border border-carbon/10 bg-white/70 px-4 py-2.5 text-sm text-carbon outline-none focus:border-rosa-fuerte"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-rosa-fuerte px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rosa"
        >
          Enviar mensaje
        </button>
        <p className="text-xs text-carbon/40">
          [PENDIENTE: conectar este formulario a Resend/API una vez definido
          el flujo de notificaciones — módulo 8 del plan]
        </p>
      </form>
    </div>
  );
}
