# Hexagonal Architecture (Ports & Adapters)

_This rule describes the Hexagonal Architecture (also known as Ports & Adapters), a software architectural pattern that emphasizes separation of concerns, testability, and adaptability by decoupling the core logic from external systems._

## Context

_Apply these rules when designing, implementing, or refactoring systems that require clear boundaries between business logic and external dependencies._

**Applies to:** Backend services, APIs, microservices, modular applications, legacy modernization
**Level:** Strategic & Tactical
**Audience:** Developers, Architects, Product Team

## Core Principles

1. **Separation of Concerns:** Isolate business logic from infrastructure and external systems.
2. **Dependency Inversion:** Core logic depends on abstractions (ports), not concrete implementations (adapters).
3. **Testability:** Enable easy testing of core logic by substituting adapters.
4. **Port Granularity:** Design ports at the right level - cohesive operations, not too fine-grained.

## Rules

### Must Have (Critical)

- **RULE-001:** Core business logic must not depend on frameworks, databases, or external services directly.
- **RULE-002:** All interactions with external systems must occur through well-defined ports (interfaces).
- **RULE-003:** Adapters must implement ports and be swappable without changing core logic.
- **RULE-004:** Ports must not leak infrastructure concerns into business logic (no database types, HTTP objects, etc.).

### Should Have (Important)

- **RULE-101:** Use dependency injection to provide adapters to the core.
- **RULE-102:** Keep ports technology-agnostic and focused on business use cases.
- **RULE-103:** Organize code so that the core domain is central and adapters are peripheral.
- **RULE-104:** Handle cross-cutting concerns (logging, metrics) via decorators or middleware, not in core logic.

### Could Have (Preferred)

- **RULE-201:** Use clear naming conventions (e.g., `*Port`, `*Adapter`).
- **RULE-202:** Document each port and adapter's responsibility.
- **RULE-203:** Use automated tests to verify adapter compliance with ports.

## Patterns & Anti-Patterns

### ✅ Do This

```python
# Port (interface) - business-focused
class OrderRepository:
    def save(self, order: Order) -> OrderId:
        pass
    def find_by_customer(self, customer_id: str) -> List[Order]:
        pass

# Adapter (infrastructure) - handles technical details
class PostgresOrderAdapter(OrderRepository):
    def save(self, order: Order) -> OrderId:
        # Convert domain object to database format
        sql = "INSERT INTO orders..."
        return self.execute(sql)
```

### ❌ Don't Do This

```python
# Leaky port - exposes infrastructure concerns
class OrderRepository:
    def save(self, order_dict: Dict, connection: Connection) -> None:
        pass  # Exposes database connection to core logic
```

## Decision Framework

**When to create new ports:**
1. Different business purposes (user management vs order processing)
2. Different data consistency requirements
3. Different performance characteristics needed

**When to extend existing ports:**
1. Related operations on same domain entity
2. Same consistency and performance requirements
3. Would naturally be used together

**Port design guidelines:**
- Name ports by business capability, not technology
- Include only operations the business logic needs
- Return domain objects, not infrastructure types
- Handle errors at the adapter boundary

## Exceptions & Waivers

**Valid reasons for exceptions:**
- Performance-critical code requiring direct access (with approval)
- Temporary legacy integration (with migration plan)
- Prototyping or proof-of-concept

**Process for exceptions:**
1. Document the exception and rationale
2. Get approval from architecture owner
3. Review exception periodically

## Quality Gates

- **Automated checks:** Dependency analysis tools to detect core→infrastructure dependencies
- **Code review focus:** Verify ports are business-focused, adapters handle only technical concerns
- **Testing requirements:** Core logic must be testable with mock adapters; >90% test coverage achievable
- **Architecture metrics:** Core modules should have zero dependencies on infrastructure packages

## Related Rules

- `rules/domain-driven-design-rules.md` - DDD complements Hexagonal by defining the domain model

## References

- [Alistair Cockburn: Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) - Original description
- [Martin Fowler: Ports and Adapters](https://martinfowler.com/bliki/PortsAndAdapters.html) - Overview and context
- [Hexagonal Architecture Wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)) - Summary

---

## TL;DR

**Key Principles:**
- Keep business logic isolated from external systems
- Depend on abstractions, not implementations
- Make core logic easily testable

**Critical Rules:**
- Core logic must never depend on infrastructure directly
- All external interactions must use ports (interfaces)
- Ports must not leak infrastructure concerns into business logic
- Adapters must be swappable without changing core logic

**Quick Decision Guide:**
When in doubt: Ask "Does this expose infrastructure details to business logic?" If yes, refactor to use a proper port and adapter.
