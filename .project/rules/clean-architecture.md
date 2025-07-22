# Clean Architecture

_A set of architectural principles and rules that promote separation of concerns, maintainability, and testability in software systems. Clean Architecture organizes code into concentric layers, each with clear responsibilities and strict boundaries, to enable flexible, robust, and scalable applications._

## Architecture Layers

Clean Architecture defines four concentric layers:

1. **Entities (Core):** Business objects and enterprise-wide business rules
2. **Use Cases (Application):** Application-specific business rules and workflows
3. **Interface Adapters (Presentation):** Controllers, presenters, gateways that convert data
4. **Frameworks & Drivers (Infrastructure):** External frameworks, databases, web frameworks, UI

## Context

Clean Architecture applies to backend and frontend applications, services, and systems where long-term maintainability, testability, and adaptability are priorities.

**Applies to:** All software projects, especially those with complex business logic or long-term maintenance needs  
**Level:** Strategic  
**Audience:** Developers, Architects, Product Teams

## Core Principles

1. **Separation of Concerns:** Each layer has a distinct responsibility, reducing coupling and increasing clarity.
2. **Dependency Rule:** Dependencies always point inward, from outer layers to inner layers, never the reverse.
3. **Testability:** Business logic is isolated from frameworks and external systems, making it easy to test.

## Rules

### Must Have (Critical)

- **RULE-001:** Organize code into four distinct layers: Entities (business objects), Use Cases (application logic), Interface Adapters (controllers/presenters), and Frameworks/Drivers (external systems).
- **RULE-002:** Inner layers must not depend on outer layers; dependencies flow only inward (Dependency Rule).
- **RULE-003:** Business rules (Entities, Use Cases) must not import or depend on frameworks, databases, UI components, or external libraries.

### Should Have (Important)

- **RULE-101:** Use interfaces/abstractions to invert dependencies; outer layers depend on inner layer interfaces.
- **RULE-102:** Keep data transfer objects (DTOs) and API models separate from business entities.
- **RULE-103:** Place all framework dependencies (databases, HTTP clients, file systems) in the outermost layer.
- **RULE-104:** Use dependency injection to provide implementations to inner layers.

### Could Have (Preferred)

- **RULE-201:** Use consistent naming conventions for layer components (e.g., UseCase, Repository, Controller suffixes).
- **RULE-202:** Keep controllers and presenters thin; delegate all business logic to use cases.
- **RULE-203:** Document layer boundaries and responsibilities clearly in code comments or README files.
- **RULE-204:** Implement cross-cutting concerns (logging, validation) through the outer layers only.

## Patterns & Anti-Patterns

### ✅ Do This

```python
# Use case layer (business logic)
class CreateOrderUseCase:
    def __init__(self, order_repo: OrderRepository):
        self.order_repo = order_repo
    
    def execute(self, order_data: OrderData) -> Order:
        # Apply business rules
        order = Order.create(order_data)
        if not order.is_valid():
            raise InvalidOrderError()
        return self.order_repo.save(order)
```

```typescript
// Interface adapter layer
class OrderController {
    constructor(private createOrderUseCase: CreateOrderUseCase) {}
    
    async createOrder(request: Request): Promise<Response> {
        const orderData = this.mapRequestToOrderData(request);
        const order = await this.createOrderUseCase.execute(orderData);
        return this.mapOrderToResponse(order);
    }
}
```

### ❌ Don't Do This

```python
# Business logic directly depends on framework
from flask import request
from sqlalchemy import create_engine

def create_order():
    data = request.json  # Framework dependency in business logic
    engine = create_engine('sqlite:///orders.db')  # Database dependency
    # business logic mixed with infrastructure
```

## Decision Framework

**When rules conflict:**

1. Prioritize the Dependency Rule.
2. Favor testability and maintainability over convenience.
3. Consult the team for edge cases.

**When facing edge cases:**

- Prefer abstraction over direct dependency.
- Keep business logic pure and framework-agnostic.
- Document any justified exceptions.

## Exceptions & Waivers

**Valid reasons for exceptions:**

- Performance optimizations with documented rationale
- Legacy system integration with clear boundaries
- Temporary expediency with a plan for refactoring

**Process for exceptions:**

1. Document the exception and rationale
2. Get team or architect approval
3. Review and refactor within a set timeframe

## Quality Gates

- **Automated checks:** Use dependency analyzers to verify layer boundaries, lint for framework imports in business logic
- **Code review focus:** Verify business logic is framework-agnostic, check dependency directions, ensure proper abstraction usage
- **Testing requirements:** Unit tests for entities and use cases (no external dependencies), integration tests for adapters, end-to-end tests for full workflows

## Related Rules

- `rules/hexagonal-architecture.md` - Alternative architecture with similar goals
- `rules/solid-principles.md` - Principles that complement Clean Architecture
- `rules/layered-architecture.md` - Related but less strict on dependency direction

## References

- [Clean Architecture by Robert C. Martin](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html) - Foundational article
- [The Clean Architecture Book](https://www.oreilly.com/library/view/clean-architecture/9780134494272/) - In-depth resource
- [Clean Architecture on Wikipedia](https://en.wikipedia.org/wiki/Clean_architecture) - Overview

---

## TL;DR

**Key Principles:**
- Separate concerns by layer
- Dependencies point inward
- Business logic is framework-agnostic

**Critical Rules:**
- Must organize code into layers
- Must not let business logic depend on frameworks
- Always keep dependencies flowing inward

**Quick Decision Guide:**
When in doubt: Keep business logic pure and independent of frameworks, UI, and databases.
