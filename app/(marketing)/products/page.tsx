import Link from "next/link";

import SectionHeading from "../components/SectionHeading";
import { BoltIcon, ShieldIcon, StarIcon, WarnIcon } from "../components/icons";

export default function ProductsPage() {
  return (
    <main>
      <div className="page-hero">
        <SectionHeading title="Products" sub="Explore our hybrid inverter series" />
      </div>

      <section className="section products-preview">
        <div className="product-cards">
          {[
            {
              name: "AURAWATT SP SERIES",
              range: "Single Phase Inverters",
              warranty: "8 / 10 Years*",
              charging: "Fast 230A Charging",
              efficiency: "99.9% | MPPTs Efficiency",
              overload: "200% | Overload Tolerance",
              ip: "IP66 Rating Design",
              href: "/products/single-phase",
            },
            {
              name: "AURAWATT TP-L / TP-H SERIES",
              range: "Three Phase Inverters",
              warranty: "8 / 10 Years*",
              charging: "Fanless | Silent Design",
              efficiency: "99.9% | MPPTs Efficiency",
              overload: "150% | Overload Tolerance",
              ip: "IP65 / IP66 Rating Design",
              href: "/products/three-phase",
            },
          ].map((p) => (
            <Link key={p.name} className="product-card" href={p.href}>
              <div className="product-card__img">
                <span>⚡</span>
              </div>
              <h4>{p.name}</h4>
              <p className="product-card__range">{p.range}</p>
              <ul>
                <li>
                  <ShieldIcon /> {p.warranty}
                </li>
                <li>
                  <BoltIcon /> {p.charging}
                </li>
                <li>
                  <StarIcon /> {p.efficiency}
                </li>
                <li>
                  <WarnIcon /> {p.overload}
                </li>
                <li>
                  <ShieldIcon /> {p.ip}
                </li>
              </ul>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

