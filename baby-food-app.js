// 宝宝辅食系统 - 应用逻辑

// 当前选中的分类
let currentCategory = 'porridge';

// 当前选中的餐次筛选
let currentMealFilter = 'all';

// 历史记录
let history = JSON.parse(localStorage.getItem('babyFoodHistoryV2')) || [];

// 初始化
window.onload = function() {
    updateDateDisplay();
    renderNavTabs();
    renderCategoryViews();
    switchCategory('porridge');
};

// 渲染导航标签
function renderNavTabs() {
    const navTabs = document.getElementById('navTabs');
    navTabs.innerHTML = categories.map(cat => `
        <button class="nav-tab ${cat.id === currentCategory ? 'active' : ''}" 
                onclick="switchCategory('${cat.id}')">
            ${cat.name}
        </button>
    `).join('');
}

// 渲染分类视图
function renderCategoryViews() {
    const container = document.getElementById('categoryViews');
    container.innerHTML = categories.map(cat => `
        <div class="category-view ${cat.id === currentCategory ? 'active' : ''}" 
             id="category-${cat.id}">
            <div class="recipes-grid" id="recipes-${cat.id}"></div>
        </div>
    `).join('');
    
    // 渲染每个分类的食谱
    categories.forEach(cat => {
        renderRecipes(cat.id);
    });
}

// 渲染食谱卡片
function renderRecipes(categoryId) {
    const recipesGrid = document.getElementById(`recipes-${categoryId}`);
    const recipes = recipeDatabase[categoryId] || [];
    
    // 根据餐次筛选
    const filteredRecipes = recipes.filter(recipe => {
        if (currentMealFilter === 'all') return true;
        return recipe.mealType && recipe.mealType.includes(currentMealFilter);
    });
    
    // 如果没有符合筛选条件的食谱，显示提示
    if (filteredRecipes.length === 0) {
        recipesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 18px;">😔 该分类暂无适合此餐次的食谱</p>
                <p style="margin-top: 10px; font-size: 14px;">请切换其他餐次或分类查看</p>
            </div>
        `;
        return;
    }
    
    recipesGrid.innerHTML = filteredRecipes.map((recipe, index) => {
        // 获取原始索引
        const originalIndex = recipes.indexOf(recipe);
        
        // 生成餐次标签
        const mealTypeBadges = recipe.mealType ? recipe.mealType.map(type => {
            const labels = {
                'breakfast': '🌅 早餐',
                'lunch': '☀️ 午餐',
                'dinner': '🌙 晚餐',
                'snack': '🍎 加餐'
            };
            return `<span class="meal-type-badge meal-type-${type}">${labels[type] || type}</span>`;
        }).join('') : '';
        
        return `
            <div class="recipe-card" onclick="showRecipeDetail('${categoryId}', ${originalIndex})">
                <div class="recipe-header">${recipe.name}</div>
                <div class="recipe-body">
                    ${mealTypeBadges ? `
                        <div style="margin-bottom: 10px;">
                            ${mealTypeBadges}
                        </div>
                    ` : ''}
                    <div class="recipe-section">
                        <h4>🥘 食材</h4>
                        <p>${recipe.ingredients}</p>
                    </div>
                    <div class="recipe-section">
                        <h4>💪 营养价值</h4>
                        <p>${recipe.nutrition}</p>
                    </div>
                    <div class="nutrition-tags">
                        ${recipe.tags.map(tag => `<span class="nutrition-tag">${tag}</span>`).join('')}
                    </div>
                    <p style="margin-top: 15px; color: #667eea; font-size: 13px; text-align: center;">
                        点击查看详细做法 →
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

// 切换分类
function switchCategory(categoryId) {
    currentCategory = categoryId;
    
    // 更新导航标签状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 找到被点击的标签并激活
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        if (tab.textContent.includes(categories.find(c => c.id === categoryId).name)) {
            tab.classList.add('active');
        }
    });
    
    // 更新分类视图显示
    document.querySelectorAll('.category-view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`category-${categoryId}`).classList.add('active');
    
    // 重新渲染食谱（保持当前的餐次筛选）
    renderRecipes(categoryId);
}

// 按餐次筛选
function filterByMealType(mealType) {
    currentMealFilter = mealType;
    
    // 更新筛选按钮状态
    document.querySelectorAll('.meal-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新渲染当前分类的食谱
    renderRecipes(currentCategory);
}

// 显示食谱详情
function showRecipeDetail(categoryId, index) {
    const recipe = recipeDatabase[categoryId][index];
    const modal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = recipe.name;
    modalBody.innerHTML = `
        <div class="recipe-section">
            <h4>🥘 食材准备</h4>
            <p>${recipe.ingredients}</p>
        </div>
        
        <div class="recipe-section">
            <h4>📝 详细步骤</h4>
            <ol>
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>
        
        <div class="recipe-section">
            <h4>💪 营养价值</h4>
            <p>${recipe.nutrition}</p>
        </div>
        
        ${recipe.note ? `
            <div class="recipe-note">
                <strong>⚠️ 注意事项：</strong><br>
                ${recipe.note}
            </div>
        ` : ''}
        
        <div class="nutrition-tags">
            ${recipe.tags.map(tag => `<span class="nutrition-tag">${tag}</span>`).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

// 关闭模态框
function closeModal() {
    document.getElementById('recipeModal').classList.remove('active');
}

// 智能生成今日食谱（营养均衡版）
function generateDailyMeals() {
    const usedCategories = new Set(); // 记录已使用的分类
    const nutritionTracker = {
        hasEgg: false,        // 是否有蛋类
        hasMeat: false,       // 是否有肉/鱼类
        hasVegetable: false,  // 是否有蔬菜
        hasFruit: false       // 是否有水果
    };
    
    // 早餐：碳水为主 + 可选蛋白质
    const breakfast = getRandomRecipeForMeal('breakfast', usedCategories, nutritionTracker, {
        preferCategories: ['porridge', 'noodles', 'pancakes', 'steamed'],
        needProtein: true  // 早餐尽量包含蛋白质
    });
    
    // 午餐：必须有蛋白质 + 碳水 + 蔬菜
    const lunch = getRandomRecipeForMeal('lunch', usedCategories, nutritionTracker, {
        preferCategories: ['rice', 'noodles', 'eggs'],  // 米饭配菜、面食、蛋类
        needProtein: true,
        needVegetable: true
    });
    
    // 晚餐：补充一天未摄入的营养素
    const dinner = getRandomRecipeForMeal('dinner', usedCategories, nutritionTracker, {
        needProtein: !nutritionTracker.hasMeat,
        needVegetable: !nutritionTracker.hasVegetable,
        needEgg: !nutritionTracker.hasEgg
    });
    
    // 加餐：优先水果，其次零食
    const snack = getRandomRecipeForMeal('snack', usedCategories, nutritionTracker, {
        preferCategories: ['fruits', 'snacks']
    });
    
    const meals = {
        breakfast,
        lunch,
        dinner,
        snack,
        date: new Date().toLocaleDateString('zh-CN')
    };
    
    displayMealsModal(meals);
    saveToHistory(meals);
}

// 获取适合指定餐次的随机食谱（营养均衡版）
function getRandomRecipeForMeal(mealType, usedCategories = new Set(), nutritionTracker = {}, options = {}) {
    // 按分类收集食谱
    const recipesByCategory = {};
    
    categories.forEach(cat => {
        const recipes = recipeDatabase[cat.id] || [];
        const suitableRecipes = recipes.filter(recipe => 
            !recipe.mealType || recipe.mealType.includes(mealType)
        );
        
        if (suitableRecipes.length > 0) {
            recipesByCategory[cat.id] = suitableRecipes.map(recipe => ({
                ...recipe,
                categoryId: cat.id,
                categoryName: cat.name
            }));
        }
    });
    
    // 获取可用的分类
    let availableCategories = Object.keys(recipesByCategory);
    
    // 如果指定了偏好分类，优先从中选择
    if (options.preferCategories && options.preferCategories.length > 0) {
        const preferAvailable = availableCategories.filter(cat => 
            options.preferCategories.includes(cat) && !usedCategories.has(cat)
        );
        if (preferAvailable.length > 0) {
            availableCategories = preferAvailable;
        }
    }
    
    // 如果没有偏好分类，优先选择未使用的分类
    if (!options.preferCategories) {
        const unusedCategories = availableCategories.filter(cat => !usedCategories.has(cat));
        if (unusedCategories.length > 0) {
            availableCategories = unusedCategories;
        }
    }
    
    // 营养需求优先级筛选
    if (options.needEgg && availableCategories.includes('eggs')) {
        availableCategories = ['eggs'];  // 优先选择蛋类
    } else if (options.needProtein) {
        const proteinCategories = availableCategories.filter(cat => 
            ['eggs', 'rice', 'soups'].includes(cat)  // 蛋类、米饭配菜、汤羹类含蛋白质
        );
        if (proteinCategories.length > 0) {
            availableCategories = proteinCategories;
        }
    }
    
    if (availableCategories.length === 0) {
        console.error('没有找到适合的食谱');
        return null;
    }
    
    // 随机选择一个分类
    const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
    const selectedCategory = availableCategories[randomCategoryIndex];
    
    // 从该分类中随机选择一个食谱
    const categoryRecipes = recipesByCategory[selectedCategory];
    const randomRecipeIndex = Math.floor(Math.random() * categoryRecipes.length);
    const selectedRecipe = categoryRecipes[randomRecipeIndex];
    
    // 更新营养追踪
    updateNutritionTracker(selectedCategory, selectedRecipe, nutritionTracker);
    
    // 记录已使用的分类
    usedCategories.add(selectedCategory);
    
    return selectedRecipe;
}

// 更新营养追踪器
function updateNutritionTracker(categoryId, recipe, tracker) {
    // 根据分类和食谱名称判断营养类型
    if (categoryId === 'eggs' || (recipe.name && recipe.name.includes('蛋'))) {
        tracker.hasEgg = true;
    }
    
    if (categoryId === 'rice' || categoryId === 'soups' || 
        (recipe.name && (recipe.name.includes('肉') || recipe.name.includes('鱼') || 
                        recipe.name.includes('虾') || recipe.name.includes('鸡')))) {
        tracker.hasMeat = true;
    }
    
    if (categoryId === 'rice' || 
        (recipe.name && (recipe.name.includes('菜') || recipe.name.includes('菠菜') || 
                        recipe.name.includes('胡萝卜') || recipe.name.includes('西兰花')))) {
        tracker.hasVegetable = true;
    }
    
    if (categoryId === 'fruits') {
        tracker.hasFruit = true;
    }
}

// 显示食谱模态框
function displayMealsModal(meals) {
    const modal = document.getElementById('mealsModal');
    const dateDisplay = document.getElementById('modalDateDisplay');
    const mealsGrid = document.getElementById('mealsGrid');
    
    dateDisplay.textContent = meals.date;
    
    // 创建一个辅助函数来生成每餐的HTML
    function createMealHTML(meal, mealName, headerClass) {
        return `
            <div class="meal-card">
                <div class="meal-header ${headerClass}">${mealName}</div>
                <div class="meal-body">
                    <div class="recipe-name">${meal.name}</div>
                    
                    <div class="recipe-section">
                        <h4>🥘 食材</h4>
                        <p>${meal.ingredients}</p>
                    </div>
                    
                    <div class="recipe-section">
                        <h4>📝 做法</h4>
                        <ol style="padding-left: 20px; margin-top: 8px;">
                            ${meal.steps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
                        </ol>
                    </div>
                    
                    ${meal.note ? `
                        <div class="recipe-note">
                            <strong>⚠️ 注意：</strong>${meal.note}
                        </div>
                    ` : ''}
                    
                    <div class="nutrition-tags">
                        ${meal.tags.map(tag => `<span class="nutrition-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    mealsGrid.innerHTML = 
        createMealHTML(meals.breakfast, '早餐', 'breakfast-header') +
        createMealHTML(meals.lunch, '午餐', 'lunch-header') +
        createMealHTML(meals.dinner, '晚餐', 'dinner-header') +
        `<div class="meal-card">
            <div class="meal-header" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); color: #2d3436;">加餐</div>
            <div class="meal-body">
                <div class="recipe-name">${meals.snack.name}</div>
                
                <div class="recipe-section">
                    <h4>🥘 食材</h4>
                    <p>${meals.snack.ingredients}</p>
                </div>
                
                <div class="recipe-section">
                    <h4>📝 做法</h4>
                    <ol style="padding-left: 20px; margin-top: 8px;">
                        ${meals.snack.steps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
                    </ol>
                </div>
                
                ${meals.snack.note ? `
                    <div class="recipe-note">
                        <strong>⚠️ 注意：</strong>${meals.snack.note}
                    </div>
                ` : ''}
                
                <div class="nutrition-tags">
                    ${meals.snack.tags.map(tag => `<span class="nutrition-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>`;
    
    modal.classList.add('active');
}

// 关闭食谱模态框
function closeMealsModal() {
    document.getElementById('mealsModal').classList.remove('active');
}

// 保存到历史
function saveToHistory(meals) {
    history.unshift(meals);
    if (history.length > 30) {
        history = history.slice(0, 30);
    }
    localStorage.setItem('babyFoodHistoryV2', JSON.stringify(history));
}

// 显示历史记录
function showHistory() {
    if (history.length === 0) {
        alert('暂无历史记录');
        return;
    }
    
    const historyHTML = history.map((meals, index) => `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 10px; cursor: pointer;"
             onclick='displayMealsModal(${JSON.stringify(meals).replace(/'/g, "\\'")})'>
            <strong>${meals.date}</strong><br>
            早: ${meals.breakfast.name} | 午: ${meals.lunch.name} | 晚: ${meals.dinner.name} | 加餐: ${meals.snack.name}
        </div>
    `).join('');
    
    const modal = document.getElementById('recipeModal');
    document.getElementById('modalTitle').textContent = '历史记录';
    document.getElementById('modalBody').innerHTML = historyHTML;
    modal.classList.add('active');
}

// 更新日期显示
function updateDateDisplay() {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById('dateDisplay').textContent = today.toLocaleDateString('zh-CN', options);
}

// 打印食谱
function printMeals() {
    window.print();
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const recipeModal = document.getElementById('recipeModal');
    const mealsModal = document.getElementById('mealsModal');
    if (event.target === recipeModal) {
        closeModal();
    }
    if (event.target === mealsModal) {
        closeMealsModal();
    }
}

