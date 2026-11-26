# Architecture diagrams

The component and local deployment diagrams describe the current implementation. The component view groups related business modules for readability; it is not a complete import graph. The AWS diagram describes a proposed deployment based on the project requirements, not currently provisioned infrastructure.

| Diagram | Preview | Scalable export | Editable source |
| --- | --- | --- | --- |
| Components | [PNG](component-diagram.png) | [SVG](component-diagram.svg) | [PlantUML](component-diagram.puml) |
| Deployment | [PNG](deployment-diagram.png) | [SVG](deployment-diagram.svg) | [PlantUML](deployment-diagram.puml) |
| Proposed AWS architecture | [PNG](aws-architecture.png) | [SVG](aws-architecture.svg) | [PlantUML](aws-architecture.puml) |
| Domain classes | [PNG](class-diagram.png) | [SVG](class-diagram.svg) | [PlantUML](class-diagram.puml) |
| Use cases by role | [PNG](use-case-diagram.png) | [SVG](use-case-diagram.svg) | [PlantUML](use-case-diagram.puml) |

Use SVG for sharp output in reports and slides; use PNG where SVG is unsupported.

## Regenerate

Install Java and download the [PlantUML JAR](https://plantuml.com/download). From the repository root, set the JAR path and run:

```powershell
$plantumlJar = 'C:\path\to\plantuml.jar'
java '-Djava.awt.headless=true' -jar $plantumlJar -tsvg 'docs/architecture/diagrams/*.puml'
java '-Djava.awt.headless=true' -jar $plantumlJar -tpng 'docs/architecture/diagrams/*.puml'
```

Rendered with PlantUML 1.2025.2. The AWS diagram uses the bundled Smetana layout engine. The component, local deployment, class and use case diagrams use Graphviz to honor their node and rank spacing; PlantUML's bundled Windows Graphviz was used here. Other environments may require a Graphviz installation. Notation references: [component diagrams](https://plantuml.com/component-diagram), [deployment diagrams](https://plantuml.com/deployment-diagram), [class diagrams](https://plantuml.com/class-diagram), and [use case diagrams](https://plantuml.com/use-case-diagram).

## Class and use case scope

The class diagram shows all four persisted domain classes and all three enums from `backend/app/models.py`, including attributes, nullable values, foreign-key associations and multiplicities. User roles are enum values, not Customer/Host/Admin subclasses. Entity methods are not invented: application operations are module functions. Framework classes and request/response schemas are omitted from this domain view. Association labels have opaque backgrounds to keep relationship lines clear of their text.

The use case diagram presents three role views of the same system, repeating the application boundary and login use case for readability. It shows the principal implemented goals found in `frontend/src/App.jsx` and `backend/app/routers/*`; it is not an exhaustive endpoint inventory. Google Maps is an external supporting actor. Search, listing details and maps are public; protected actions enforce role access. Admin removal and Maps address search from the requirements are not shown as implemented features: current admin routes approve/reject listings, and the UI embeds a location map.

## Proposed AWS architecture

The assignment requires a cloud database, a load balancer, and an auto-scaled EC2 API cluster. This design places the API on EC2 and chooses managed RDS PostgreSQL for the database, with Amplify Hosting for the React production build. The two illustrated instances show distribution across availability zones, not a fixed capacity limit. Google Maps address search is a target requirement; the current UI implements an embedded location map.

The browser downloads the UI from Amplify, calls the ALB's HTTPS API endpoint, and accesses Google Maps directly. The ALB forwards requests to healthy EC2 targets. A request-count target-tracking policy adjusts the Auto Scaling group's capacity through CloudWatch metrics. All API instances use the same database and JWT signing secret. The RDS subnet group spans two zones; this does not imply that a Multi-AZ database standby has been selected.

This is an architectural view, not a provisioning specification: DNS, certificate issuance, IAM, secret delivery, internet-gateway routes, and private-subnet deployment egress are omitted. Before deploying, configure the public API URL and allowed frontend origin, migrate and seed PostgreSQL once, and verify booking concurrency against the shared database across multiple API instances. No cloud resources were created by adding this diagram.

AWS references: [ALB listeners, target groups and subnets](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html), [ALB integration with EC2 Auto Scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html), and [RDS private networking and subnet groups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html).

## Implementation details reflected here

- React executes in the browser. The frontend container serves development assets; browser requests go directly to the backend at `localhost:8000/api/v1`.
- Google Maps is an external iframe loaded by the browser.
- The backend is one deployable. Search queries currently live in its router; several other routes also query SQLAlchemy directly.
- SQLite is embedded in the backend process, with its database file persisted in the `backend-data` volume at `/app/data`.
- The load balancer, scaled backend instances, and PostgreSQL described in `../system-overview.md` are planned architecture, not infrastructure provisioned by the current Compose file.

Sources checked: `docker-compose.yml`, both Dockerfiles, `frontend/src/App.jsx`, `frontend/src/api.js`, and the backend entry point, routers, modules, security dependencies, and persistence configuration. Update and regenerate these diagrams when those boundaries change.
