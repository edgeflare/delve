import { Component, signal } from '@angular/core';
import { Reveal2Component } from 'projects/ng-essential/src/lib/reveal2/reveal2.component';

@Component({
  selector: 'e-home',
  standalone: true,
  imports: [Reveal2Component],
  template: `
  <ng-reveal2 [content]="content()"></ng-reveal2>
  `,
})
export class HomeComponent {
  content = signal(`
<section>
  <p>PostgreSQL Architecture</p>
  <div class="mermaid center" style="height: 50vh;">graph TD
    subgraph PostgreSQL_Architecture
    A[Client Applications] -->|SQL Queries| B[Postmaster]

    subgraph Connection_Management
    style Connection_Management fill:#f9f,stroke:#333,stroke-width:4px
    B --> C[Backend Processes]
    B --> M[Client Authentication]
    B -->|Connection Pooling| C
    end

    subgraph Query_Processing
    style Query_Processing fill:#bbf,stroke:#333,stroke-width:4px
    C --> D[Parser]
    D --> E[Planner/Optimizer]
    E --> F[Executor]
    F -.->|Reads/Writes| G
    end

    subgraph Transaction_Management
    style Transaction_Management fill:#cfc,stroke:#333,stroke-width:4px
    TM[Transaction Manager] --> F
    TM -.->|Locks/Unlocks| LM[Lock Manager]
    end

    subgraph Memory_Structures
    style Memory_Structures fill:#dfd,stroke:#333,stroke-width:4px
    F --> G[Shared Buffers]
    F --> O[Work Memory]
    F --> Q[Sort Memory]
    end

    subgraph Write-Ahead_Logging
    style Write-Ahead_Logging fill:#fdd,stroke:#333,stroke-width:4px
    F --> H[WAL Buffer]
    H --> I[WAL Writer]
    I --> J[WAL Files]
    end

    subgraph Storage
    style Storage fill:#ffd,stroke:#333,stroke-width:4px
    G --> K[Data Files]
    G --> R[TOAST Tables]
    K -.-> CT[Catalog Tables]
    end

    subgraph Background_Processes
    style Background_Processes fill:#dff,stroke:#333,stroke-width:4px
    J --> L[Checkpointer]
    G --> L
    G --> N[Background Writer]
    G --> P[Autovacuum Daemon]
    B --> S[Statistics Collector]
    end

    subgraph Maintenance_Tasks
    style Maintenance_Tasks fill:#cfc,stroke:#333,stroke-width:4px
    P --> T[Vacuum]
    P --> U[Analyze]
    S --> V[Statistics Database]
    end

    subgraph Replication
    style Replication fill:#cfd,stroke:#333,stroke-width:4px
    J --> W[WAL Sender/<br>Logical Replication]
    W --> X[Standby Server]
    X --> Y[Streaming Replication]
    J --> Z[Archive Command]
    Z --> AA[WAL Archive]
    end

    subgraph Security
    style Security fill:#fcc,stroke:#333,stroke-width:4px
    B --> AB[Authentication Methods/<br>SSL/TLS]
    C --> AC[Access Control/<br>Row Level Security]
    end
    end
  </div>
</section>

<section>
  <section>
    <pre><code data-trim data-noescape>
  (def lazy-fib
    (concat
     [0 1]
     ((fn rfib [a b]
          (lazy-cons (+ a b) (rfib b (+ a b)))) 0 1)))
    </code></pre>
  </section>
  <section>Vertical Slide 2</section>
</section>
`
  );
}
