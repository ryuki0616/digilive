// ディジタライブ・アドベンチャー JavaScript

// DOM読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('ディジタライブ・アドベンチャーが開始されました！');
    
    // コンテンツボックスにアニメーション効果を追加
    const contentBox = document.querySelector('.content-box');
    if (contentBox) {
        contentBox.style.opacity = '0';
        contentBox.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            contentBox.style.transition = 'all 0.6s ease-out';
            contentBox.style.opacity = '1';
            contentBox.style.transform = 'translateY(0)';
        }, 500);
    }
});

// キーボードショートカット
document.addEventListener('keydown', function(event) {
    switch(event.key.toLowerCase()) {
        case 'r':
            // ページリロード
            location.reload();
            break;
        case 'h':
            // ヘルプメッセージ表示
            alert('キーボードショートカット:\nR - ページリロード\nH - ヘルプ表示');
            break;
    }
});

// マウス移動による視差効果
document.addEventListener('mousemove', function(event) {
    const x = event.clientX / window.innerWidth;
    const y = event.clientY / window.innerHeight;
    
    document.body.style.backgroundPosition = `${x * 50}% ${y * 50}%`;
});