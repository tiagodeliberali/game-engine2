import { CodeComponent } from "../../src/code/CodeComponent";
import { CodeProcessor } from "../../src/code/CodeProcessor";

test('init calls initAction of all initComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent();
    component.initAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.init();

    // Assert
    expect(wasCalled).toBe(true);
});

test('update calls updateAction of all updateComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent();
    component.updateAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.update(0);

    // Assert
    expect(wasCalled).toBe(true);
});

test('fixedUpdate calls fixedUpdateAction of all fixedUpdateComponents', () => {
    // Arrange
    const processor = new CodeProcessor();
    const component = new CodeComponent();
    component.fixedUpdateAction = () => { wasCalled = true; };
    let wasCalled = false;
    
    // Act
    processor.configureCodeComponent(component);
    processor.fixedUpdate(0);

    // Assert
    expect(wasCalled).toBe(true);
});