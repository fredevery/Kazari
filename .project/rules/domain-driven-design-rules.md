# Domain Driven Design (DDD)

_Rules for implementing Domain Driven Design principles as defined by Eric Evans. These rules govern how to structure complex software systems around the business domain model and establish clear boundaries between different parts of the system._

## Context

_Domain Driven Design applies to complex software systems where business logic is intricate and requires close collaboration between technical and domain experts._

**Applies to:** Complex business applications, enterprise software, systems with rich domain logic  
**Level:** Strategic/Tactical - fundamental architecture decisions  
**Audience:** Software Architects, Senior Developers, Domain Experts, Product Teams

## Core Principles

_The foundational concepts that drive all DDD practices and decisions._

1. **Ubiquitous Language:** Use the same terminology across code, documentation, and business discussions
2. **Domain Focus:** The domain model should reflect business reality, not technical convenience
3. **Bounded Contexts:** Explicitly define boundaries where specific models and languages apply
4. **Collaboration:** Continuous partnership between developers and domain experts

## Rules

### Must Have (Critical)

_Core DDD concepts that are essential for proper implementation._

- **RULE-001:** Every aggregate must have a single root entity that controls access to the aggregate
- **RULE-002:** Domain entities must be identified by identity, not attributes
- **RULE-003:** Value objects must be immutable and defined by their attributes
- **RULE-004:** Domain services must only contain logic that doesn't naturally belong to entities or value objects
- **RULE-005:** Repositories must provide the illusion of in-memory collections of domain objects
- **RULE-006:** Domain layer must not depend on infrastructure or application layers
- **RULE-007:** Aggregates define transaction and consistency boundaries
- **RULE-008:** Repository interfaces must be defined in the domain layer

### Should Have (Important)

_Important practices that strengthen the domain model._

- **RULE-101:** Use factories to encapsulate complex object creation logic
- **RULE-102:** Apply the specification pattern for complex business rules and queries
- **RULE-103:** Domain events should represent important business occurrences
- **RULE-104:** Anticorruption layers should protect your domain from external systems
- **RULE-105:** Bounded contexts should have explicit integration strategies
- **RULE-106:** Keep aggregates small and focused on single business invariants
- **RULE-107:** Use domain events for cross-aggregate communication

### Could Have (Preferred)

_Best practices that improve maintainability and expressiveness._

- **RULE-201:** Use intention-revealing interfaces in domain services
- **RULE-202:** Implement domain-specific exceptions for business rule violations
- **RULE-203:** Apply closure of operations pattern where mathematically appropriate
- **RULE-204:** Use side-effect-free functions for calculations and queries

## Patterns & Anti-Patterns

### ✅ Do This

_Proper DDD implementation examples_

```csharp
// Rich domain model with behavior and proper aggregate design
public class Order : AggregateRoot
{
    private readonly List<OrderItem> _items = new();
    
    public void AddItem(Product product, int quantity)
    {
        if (quantity <= 0) throw new InvalidQuantityException();
        if (Status != OrderStatus.Draft) throw new OrderNotModifiableException();
        
        var item = new OrderItem(product, quantity);
        _items.Add(item);
        RaiseEvent(new ItemAddedToOrder(Id, item));
    }
}

// Value object implementation
public class Money : ValueObject
{
    public decimal Amount { get; }
    public Currency Currency { get; }
    
    public Money(decimal amount, Currency currency)
    {
        Amount = amount;
        Currency = currency;
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
```

### ❌ Don't Do This

_Anti-patterns that violate DDD principles_

```csharp
// Anemic domain model - just data containers
public class Order
{
    public List<OrderItem> Items { get; set; }
    public OrderStatus Status { get; set; }
    // No business logic - violations of domain invariants possible
}

// Cross-aggregate foreign key reference (violates aggregate boundaries)
public class Order
{
    public CustomerId CustomerId { get; set; } // Should reference by ID only
    public Customer Customer { get; set; } // Don't hold direct references
}

// Infrastructure leaking into domain
public class OrderService
{
    public void ProcessOrder(Order order, IDbContext db) // Database dependency
    {
        // Domain logic mixed with infrastructure concerns
    }
}
```

## Decision Framework

_Guidance for making decisions when applying DDD principles_

**When modeling domains:**

1. Start with the core domain - the most important business differentiator
2. Identify bounded contexts through language boundaries and team organization
3. Model aggregates around business invariants that must be consistent
4. Use event storming to discover domain events and aggregate boundaries

**When designing aggregates:**

- Keep them small (prefer multiple small aggregates over one large one)
- Reference other aggregates by ID only, never by direct object reference
- Design around business invariants that must be immediately consistent
- Limit aggregate size to what can be loaded and modified efficiently

**When facing complexity:**

- Separate core domain from supporting and generic subdomains
- Use domain experts to validate model accuracy
- Refactor towards deeper insight as understanding grows
- Consider bounded context splits when language becomes ambiguous

## Exceptions & Waivers

_When DDD principles can be relaxed_

**Valid reasons for exceptions:**

- Simple CRUD operations with minimal business logic
- Generic subdomains (like user management, notifications)
- Performance-critical paths where domain purity impacts user experience

**Process for exceptions:**

1. Document the trade-off between domain purity and practical constraints
2. Ensure the exception is contained within bounded context boundaries
3. Plan for future refactoring when constraints are removed

## Quality Gates

_How to verify DDD implementation quality_

- **Automated checks:** Domain objects should not depend on infrastructure, aggregates should not reference other aggregates directly
- **Code review focus:** Business logic should be expressed in domain terms, invariants are properly protected
- **Testing requirements:** Domain logic should be unit testable without infrastructure, aggregate boundaries are respected

## Related Rules

_References to complementary architectural patterns_

- `clean-architecture-rules.md` - Separation of concerns and dependency management
- `cqrs-rules.md` - Command Query Responsibility Segregation patterns
- `event-sourcing-rules.md` - Event-driven architecture patterns

## References

_Key resources for understanding DDD_

- [Domain-Driven Design: Tackling Complexity in the Heart of Software](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215) - Eric Evans' original book
- [Implementing Domain-Driven Design](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577) - Vaughn Vernon's implementation guide
- [DDD Reference](https://domainlanguage.com/ddd/reference/) - Quick reference guide by Eric Evans

---

## TL;DR

_Essential DDD concepts for immediate application_

**Key Principles:**

- Model the domain, not the database or UI
- Use ubiquitous language between business and technical teams
- Protect business invariants through aggregate boundaries
- Separate core domain from supporting domains

**Critical Rules:**

- Must have single aggregate root controlling access (RULE-001)
- Must define transaction boundaries at aggregate level (RULE-007)
- Must keep domain layer free of infrastructure dependencies (RULE-006)
- Must reference other aggregates by ID only (implied by RULE-001)

**Quick Decision Guide:**
When in doubt: Ask "Does this serve the domain model or technical convenience?" - always choose domain model.

**Before You Code Checklist:**
- [ ] Identified the aggregate root and its business invariants
- [ ] Defined bounded context boundaries and ubiquitous language
- [ ] Planned domain events for cross-aggregate communication
- [ ] Ensured no infrastructure dependencies in domain layer
